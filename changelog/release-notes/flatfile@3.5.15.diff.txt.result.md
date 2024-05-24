
### February 21, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        flatfile@3.5.15

        Here is a summary of the relevant changes for the flatfile package:

This release adds an exciting new feature to parse and validate CSV files! The new CsvParser struct allows you to easily parse CSV data while enforcing strict type safety. Developers can now define a struct that represents the desired shape of their CSV data, and the CsvParser will map each row to an instance of that struct. This promotes robust data handling by catching type mismatches and missing fields at parse time rather than runtime. To use it, create a CsvParser instance by passing in a struct representing a desired row shape, then call Parse() passing in the CSV data as a Reader. For example:

```go
type Employee struct {
    Name string
    Age  int
    Sales float64
}

csvData := `Name,Age,Sales
"Bob",35,25000.0
"Jane",29,30012.5`

parser := flatfile.CsvParser(Employee{})
employees, err := parser.Parse(strings.NewReader(csvData))
```

This greatly improves the safety and flexibility when working with CSV data in your applications. Give it a try today!
        </div>
  </div>

</div>
