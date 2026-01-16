export interface IGetAllOptions {
  // Important: If used, the filter property names must exist on the corresponding model interface.
  // The year(), month(), day(), hour(), minute(), second(), date(), now() OData functions are not supported.
  // dateProperty eq <some date value> is not supported. Use dateProperty ge <some date value> and dateProperty lt <some date value + 1 day> instead. To add days to a date, use the addDays() function from the date-fns library.
  // Date properties do not support OData string functions like startsWith()
  // The right side of comparison operators (eq, ne, lt, le, gt, ge) must be a constant value.
  // For lookup properties like "studentName: Pick<Student, 'id' | 'studentName'>;" the filter clause format is:
  //   - studentName/id eq 'guid-value'
  //   - studentName/studentName eq 'display-name'
  //   - studentName/id eq 'guid-value' or studentName/studentName eq 'display-name'
  // IMPORTANT:
  //   - Only properties declared in the Pick type are supported. Using undeclared properties like 'studentName/otherProperty' will throw an error.
  //   - Comparing a property that has the UUID type hint with an empty string, or any other NON-UUID value will throw an error.
  //   - Navigation is limited to 2 levels maximum (entity/property). Multi-level navigation like 'studentName/relatedEntity/someProperty' is not supported.
  filter?: string;
  // Important: If used, the orderBy property names must exist on the corresponding model interface.
  // Only supports the following formats per entry:
  //   - propertyName
  //   - propertyName asc
  //   - propertyName desc
  // Sorting by lookup properties like "studentName: Pick<Student, 'id' | 'studentName'>;" - studentName/id or studentName/studentName is not supported.
  orderBy?: string[];
}
