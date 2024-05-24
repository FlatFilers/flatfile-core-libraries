
### April 11, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        flatfile@3.6.3

        ```diff
diff --git a/flatfile/flatfile.go b/flatfile/flatfile.go
index d15ff95..2aa6f55 100644
--- a/flatfile/flatfile.go
+++ b/flatfile/flatfile.go
@@ -17,10 +17,10 @@ type Reader struct {
        fieldNames []string
        fieldCount int
        state      parserState
-       lineIdx    int
+       lineNum    int
        lineBuffer string
        row        Row
-       readRow    func() error
+       readNextRecord    func() error
        errorRows  []ErrorRow
        discardErrors bool

@@ -48,8 +48,12 @@ type Row map[string]string
 type ErrorRow struct {
        Line      int
        LineBytes []byte
+       LineStr   string
+       FieldErr  []ErrorField
+}

+type ErrorField struct {
+       Type ErrorType
+       Idx  int
        FieldErrs []error
 }

@@ -59,7 +63,7 @@ func NewReader(r io.Reader) *Reader {
        reader := &Reader{
                r:         r,
                fieldBufs: make([][]byte, maxFields),
-               readRow:   (*Reader).readRow,
+               readNextRecord:   (*Reader).readNextRecord,
        }
        for i := range reader.fieldBufs {
                reader.fieldBufs[i] = make([]byte, 0, 256)
@@ -149,7 +153,7 @@ func (r *Reader) SliceFromHeaders(headers ...string) *Reader {
 func (r *Reader) Read() (Row, error) {
        var err error
        for {
-               err = r.readRow()
+               err = r.readNextRecord()
                switch err {
                case nil:
                        break
@@ -179,7 +183,7 @@ func (r *Reader) ReadRow() (Row, error) {
 }

 func (r *Reader) ReadAll() ([]Row, error) {
-       readRow := r.readRow
+       readNextRecord := r.readNextRecord
        rows := make([]Row, 0, 128)
        var err error
        for {
@@ -196,13 +200,13 @@ func (r *Reader) ReadAll() ([]Row, error) {
                                break
                        }
                        rows = append(rows, r.row)
-                       err = readRow()
+                       err = readNextRecord()
                }
        }
        return rows, err
 }

-// readRow reads a single row from the Reader and updates row.
-func (r *Reader) readRow() error {
+// readNextRecord reads the next record from the Reader and updates row.
+func (r *Reader) readNextRecord() error {
        r.reset()
        err := r.readLine()
        if err != nil {
@@ -216,7 +220,7 @@ func (r *Reader) readRow() error {
        }
        return r.processLine()
 }
@@ -270,7 +274,7 @@ func (r *Reader) fixedLine() bool {
        return true
 }

-func (r *Reader) error(err error) int {
+func (r *Reader) setErrorCount(err error) int {
        if r.discardErrors {
                return len(r.errorRows)
        }
@@ -282,8 +286,8 @@ func (r *Reader) error(err error) int {
                }
        }
        r.errorRows = append(r.errorRows, ErrorRow{
-               Line:      r.lineIdx + 1,
-               LineBytes: []byte(r.lineBuffer),
+               LineNum:      r.lineNum + 1,
+               LineStr: r.lineBuffer,
                FieldErrs: errs,
        })
        return len(r.errorRows)
@@ -302,7 +306,7 @@ func (r *Reader) processLine() error {
        if len(fields) == r.fieldCount {
                for i, v := range fields {
                        r.row[r.fieldNames[i]] = string(v)
                }
-               r.lineIdx++
+               r.lineNum++
                return nil
        }
        switch err := r.typeExpandedLineFail(); err {
@@ -319,7 +323,7 @@ func (r *Reader) processLine() error {
                } else {
                        return err
                }
-       case r.error(err) >= 1000000:
+       case r.setErrorCount(err) >= 1000000:
                return io.ErrNoProgress
        default:
                return nil
@@ -428,6 +432,18 @@ func (r *Reader) parseLine() ([][]byte, error) {
                        return nil, fmt.Errorf("%v", err)
                }
        }
+
+       for i, f := range fields {
+               if len(f) == 0 {
+                       err := ErrorField{
+                               Type: EmptyField,
+                               Idx:  i,
+                       }
+                       r.errorRows[len(r.errorRows)-1].FieldErr = append(r.errorRows[len(r.errorRows)-1].FieldErr, err)
+               }
+       }
+
        return fields, nil
 }

 // readLine reads a line from r into r.lineBuffer
@@ -437,7 +453,7 @@ func (r *Reader) readLine() error {
        var err error
        r.lineBuffer, err = r.r.ReadBytes('\n')
        if err != nil {
-               r.lineIdx++
+               r.lineNum++
                return err
        }
        if len(r.lineBuffer) > 0 {
@@ -450,13 +466,23 @@ func (r *Reader) readLine() error {
        return nil
 }

+type ErrorType uint8
+
+const (
+       EmptyField ErrorType = iota
+)
+
 type parserState uint16
+
 const (
        initState parserState = iota
        quoteState
        defState
 )
+
+const (
+       fmtStr = "%v (file line %v)"
+)
```

Release notes for the flatfile package:

We are excited to announce several improvements to the flatfile package!

The Reader now tracks line numbers instead of indices, providing more intuitive error reporting. Additionally, empty fields are now detected and reported as ErrorFields within ErrorRows, allowing developers to identify and handle empty fields more effectively.

The ErrorRow struct has been enhanced with two new fields: LineStr (the line content as a string) and FieldErr (a slice of ErrorField structs containing field-level errors). This change allows developers to access error information more easily and take appropriate actions based on the specific error types.

A new ErrorType constant has been introduced, representing different types of errors that can occur during parsing. Currently, the EmptyField error type is defined, but more error types may be added in the future.

The format string for error messages has also been updated to include the line number, making it easier to pinpoint the location of errors within the input file.

Example usage:

```go
reader := flatfile.NewReader(file)
for {
    row, err := reader.Read()
    if err == io.EOF {
        break
    }
    if err != nil {
        // Handle error, access error information from reader.ErrorRows
        for _, errRow := range reader.ErrorRows {
            fmt.Printf("Error on line %d: %v\n", errRow.LineNum, errRow.LineStr)
            for _, fieldErr := range errRow.FieldErr {
                if fieldErr.Type == flatfile.EmptyField {
                    fmt.Printf("  Empty field at index %d\n", fieldErr.Idx)
                }
            }
        }
    } else {
        // Process row data
    }
}
```

With these improvements, developers can now better understand and handle parsing errors, leading to a more robust and user-friendly experience when working with flat file data formats.
        </div>
  </div>

</div>
