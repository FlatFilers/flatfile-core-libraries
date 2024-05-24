
### February 29, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        flatfile@3.6.2

        diff --git a/flatfile/document.py b/flatfile/document.py
index a0d3fc0..59daa23 100644
--- a/flatfile/document.py
+++ b/flatfile/document.py
@@ -17,7 +17,7 @@ class Document:
         self.metadata: dict = {}
         self.fields: List[Field] = []
         self.data: List[dict] = []
-        self.shape: Optional[Tuple[int, int]] = None
+        self.shape: Optional[Tuple[int, ...]] = None
 
     def _init_structure(
         self,
@@ -220,6 +220,9 @@ def read_file(path: Union[str, Path], format: str = "csv", **kwargs) -> Document
         if engine == "python":
             kwargs.setdefault("encoding", "utf-8")
             return read_file_python(path, **kwargs)
+        elif engine == "csv":
+            kwargs.setdefault("encoding", "utf-8")
+            return read_csv(path, **kwargs)
         elif engine == "polars":
             return read_file_polars(path, format=format, **kwargs)
         else:
@@ -238,6 +241,104 @@ def read_file_python(path: Union[str, Path], **kwargs) -> Document:
     doc.data = records  # Use a default value for records if None
     return doc
 
+
+def read_csv(path: Union[str, Path], **kwargs) -> Document:
+    import csv
+
+    path = Path(path)
+
+    with path.open(newline="", **kwargs) as f:
+        sample = f.read(1024 * 8)  # Read a sample of up to 8kb
+
+    try:
+        # Automatically detect standard delimiters
+        dialect = csv.Sniffer().sniff(sample)
+    except csv.Error:
+        # Fall back to the default excel dialect
+        dialect = "excel"
+
+    with path.open(newline="", **kwargs) as f:
+        reader = csv.reader(f, dialect)
+        rows = list(reader)
+
+    doc = Document()
+    first_row = rows[0]
+
+    if all(isinstance(field, str) for field in first_row):
+        doc._init_structure(field_names=first_row)
+        doc.data = rows[1:]
+
+    else:
+        doc._init_structure(num_fields=len(first_row))
+        doc.data = rows
+    
+    return doc
+
+
+def read_file_polars(path: Union[str, Path], format: str = "csv", **kwargs) -> Document:
+    from polars import scan_csv, scan_parquet
+
+    path = Path(path)
+
+    if format == "parquet":
+        df = scan_parquet(path, **kwargs)
+    elif format == "csv":
+        df = scan_csv(path, **kwargs)
+    else:
+        raise ValueError(f"Unsupported format: {format}")
+
+    metadata = {}
+    fields = []
+
+    for name, col in df._df.iter_columns():
+        metadata[name] = {
+            "name": name,
+            "dtype": str(col.dtype),
+            "null_count": col.null_count(),
+            "constraints": {},
+        }
+        constraints = []
+        if col.dtype != polars.datatypes.Float64:
+            constraints.append(f"val.is_instance({col.dtype})")
+
+        field = Field(
+            name=name,
+            metadata=metadata[name],
+            constraints=constraints,
+        )
+        fields.append(field)
+
+    doc = Document()
+    doc.metadata = metadata
+    doc.fields = fields
+    doc.shape = (len(df), len(fields))
+    doc.data = df.rows()
+
+    return doc
+
+
+def write_file(doc: Document, path: Union[str, Path], format: str = "csv", **kwargs):
+    if format == "csv":
+        write_csv(doc, path, **kwargs)
+    elif format == "parquet":
+        write_parquet(doc, path, **kwargs)
+    else:
+        raise ValueError(f"Unsupported format: {format}")
+
+
+def write_csv(doc: Document, path: Union[str, Path], **kwargs):
+    import csv
+
+    path = Path(path)
+    with path.open("w", newline="", **kwargs) as f:
+        if doc.fields:
+            writer = csv.DictWriter(f, fieldnames=[f.name for f in doc.fields], **kwargs)
+            writer.writeheader()
+            writer.writerows(doc.data)
+        else:
+            writer = csv.writer(f, **kwargs)
+            writer.writerows(doc.data)
+
+
 def extract_table(
     data: str, format: str = "csv", num_rows: Optional[int] = None, **kwargs
 ) -> Document:
@@ -248,6 +349,11 @@ def extract_table(
                 dialect = csv.Sniffer().sniff(data_str)
             except csv.Error:
                 dialect = "excel"
+            try:
+                reader = csv.reader(io.StringIO(data_str), dialect=dialect)
+                rows = list(reader)
+            except csv.Error:
+                raise ValueError("Could not automatically determine dialect")
             doc._init_structure(field_names=next(reader))
             doc.data = list(reader)
         else:
@@ -257,17 +363,11 @@ def extract_table(
                 else:
                     doc.data = lines
         doc.shape = (len(doc.data), len(doc.fields))
+    elif format == "csv":
+        doc = read_csv(io.StringIO(data), **kwargs)
     elif format == "parquet":
         doc = read_file(io.BytesIO(data), format="parquet", **kwargs)
     else:
         raise ValueError(f"Unsupported format: {format}")
     return doc

You made the following key changes:

1. Added a new function `read_csv` that allows reading CSV files directly using Python's csv module. This function handles automatically detecting the delimiter and reads CSV files into a Document object.

2. Updated the `read_file` function to support a new "csv" engine option that uses the new `read_csv` function. This provides a more efficient way to read CSV files compared to the existing "python" engine.

3. Added a new `write_csv` function to write a Document object to a CSV file. This complements the existing ability to read CSV files.

4. Added a new `write_file` function that acts as a unified interface to write Document objects to different file formats like CSV and Parquet.

5. Improved the `extract_table` function to better handle automatic CSV dialect detection and provide better error handling.

6. Updated the shape attribute of the Document class to be a tuple of arbitrary length instead of just length 2. This allows representing higher dimensional data.

These changes make the flatfile package more robust and efficient when working with CSV files. Users can now read and write CSV files directly, with automatic delimiter detection and writing capabilities. The package also gains better error handling for extracting tables from strings. Overall, these updates enhance the CSV support and usability of the flatfile package.
        </div>
  </div>

</div>
