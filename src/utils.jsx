export function setFieldValue(setter = (newValue) => {}) {
  return (element) => setter(element.target.value);
}
