// react-select 공통 스타일
const commonSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 56,
    borderRadius: 6,
    borderColor: state.isFocused ? "#111111" : "#ced4da",
    boxShadow: "none",
    paddingLeft: 8,
    fontSize: 16,
    fontWeight: 500,
    transition: "border-color 0.2s",
    "&:hover": {
      borderColor: "#00C471",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#929292",
    fontWeight: 500,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111111",
    fontWeight: 500,
  }),
  option: (base, state) => ({
    ...base,
    color: "#111111",
    backgroundColor: state.isSelected
      ? "#E7E7E7"
      : state.isFocused
      ? "#E6F9F1"
      : "#fff",
    fontWeight: 500,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#212529",
    paddingRight: 18,
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    marginTop: 10,
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)",
  }),
  menuList: (base) => ({
    ...base,
  }),
};

export default commonSelectStyles; 