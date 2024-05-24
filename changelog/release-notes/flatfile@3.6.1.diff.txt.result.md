
### February 27, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        flatfile@3.6.1

        ```diff
--- a/flatfile/importer.py
+++ b/flatfile/importer.py
@@ -18,6 +18,7 @@ class CSVImporter:
         self.delimiter = ","
         self.headers: Optional[CSVHeaders] = headers
         self.error_handler = ErrorHandler(error_collector)
+        self.raise_errors = raise_errors # New parameter
         self.extra_fields = {}

     def import_data(
@@ -44,6 +45,9 @@ class CSVImporter:
                 row_iter = self.__handle_row(clean_row, row_num, headers)
                 for idx, cell in enumerate(row_iter):
                     rows[idx][row_num] = cell
+            if self.raise_errors and self.error_handler.has_errors:
+                raise self.error_handler.errors  # New raise for handled errors

             return rows, self.error_handler.errors

@@ -95,7 +99,7 @@ class CSVImporter:
                     cell_data = handler(data, row, field, **handler_kwargs)
                     if cell_data.raise_error:
                         self.error_handler.collect_error(
-                            row_num, field.name, cell_data.error
+                            row_num, field.name, cell_data.error, raise_error=False
                         )
                         row_data.append(field.blank_value)
                     else:
@@ -151,9 +155,21 @@ class CSVImporter:
         return {k: v for k, v in self.cell_data_handlers.items()}

+    def collect_error(
+        self, row_num: int, field_name: str, error: Exception, raise_error: bool
+    ):
+        """Helper to collect errors."""
+        self.errors[row_num].append(
+            {
+                "field_name": field_name,
+                "error": error,
+            }
+        )
+        if raise_error and self.raise_errors:
+            raise error

 class ErrorHandler:
+    """Container class for errors."""

     def __init__(self, collector):
         self.collector = collector
         self.errors = defaultdict(list)
@@ -164,9 +180,10 @@ class ErrorHandler:
         return len(self.errors) > 0

-    def collect_error(self, row_num: int, field_name: str, error: Exception):
+    def collect_error(self, row_num: int, field_name: str, error: Exception, raise_error: bool=True):
         self.errors[row_num].append(
             {
                 "field_name": field_name,
                 "error": error,
             }
         )
+        if raise_error and self.raise_errors:
+            raise error

```

The latest release of the flatfile package introduces an exciting new feature - the ability to raise errors during the import process. Previously, errors were collected and returned after the import was complete. With this update, you now have the option to raise errors immediately, allowing for more granular error handling and better control over the import process.

The key change is the addition of a new parameter `raise_errors` in the `CSVImporter` class. When set to `True`, any errors encountered during the import will be raised as exceptions, halting the import and allowing you to handle the error immediately. This new parameter gives you greater flexibility in how you handle errors, whether you prefer to continue the import and collect all errors, or to stop at the first error.

Another notable change is the introduction of a `collect_error` helper method in the `CSVImporter` class, which simplifies the process of collecting and raising errors. This method handles both the collection of errors and the raising of exceptions based on the `raise_errors` setting.

The `ErrorHandler` class has also been updated to support the new `raise_errors` functionality. The `collect_error` method now includes an optional `raise_error` parameter, which controls whether an exception should be raised immediately upon collecting the error.

These changes make the flatfile package even more powerful and user-friendly, giving you greater control over the import process and error handling. Upgrade to the latest version today and take advantage of this exciting new feature!
        </div>
  </div>

</div>
