import { useEffect, useMemo, useState, forwardRef } from "react"
// import Select from "react-select"
import Select from "react-dropdown-select"

const AutoCompleteSelect = ({
  options,
  option: defaultOption = "",
  onChange,
  value = "",
  placeholder = "",
  timerChangePart,
  disabled,
}) => {
  const optionsGroup = useMemo(() => {
    return [
      {
        label: "Parts",
        options: options.map(v => ({
          label: !v.name ? "" : v.name || v.machine.name,
          value: v._id,
        })),
      },
    ]
  }, [options])

  const handleChange = e => setInput(e.target.value || "")

  const [input, setInput] = useState(defaultOption?.value || "")
  const [option, setOption] = useState({ label: placeholder, value: "" })

  useEffect(() => {
    setInput(defaultOption ? defaultOption.value : "")

    const label = defaultOption?.label || defaultOption || placeholder
    // console.log ('AutocompleteSelect useEffect for defaultOption : ', defaultOption, label)
    // console.log({ label: label, value: defaultOption?.value })
    setOption({ label: label, value: defaultOption?.value })

    // console.log ('AutocompleteSelect useEffect for value : ', value)
  }, [defaultOption, value, placeholder])

  const handleOnChange = async e => {
    // console.log('AutocompleteSelect changed to ', e.value);

    if (onChange) {
        console.log("PART CHANGED", e)
        if (!(await onChange(e.value))) {
          console.log("not changed")
      } else {
        console.log("PART CHANGED", e)
        setOption(e)
      }
    }
  }

  return (
    <>
      <Select
        className="react-select-container"
        onChange={handleOnChange}
        options={optionsGroup}
        value={option}
        placeholder={placeholder}
        classNamePrefix={"select2-selection w-100"}
        disabled={disabled}
        style={{
          backgroundColor: timerChangePart == "true" ? "#F5F7FA" : "red",
        }}
      />
      <input
        className="select2-container"
        type="hidden"
        name="part"
        value={input || ""}
        onChange={handleChange}
      />
    </>
  )
}

export default forwardRef(({
  options,
  option: defaultOption = "",
  onChange,
  value = null,
  option=null,
  placeholder = "",
  timerChangePart,
  disabled,
  valueField = "_id",
  labelField="name",
  loading=false,
}, ref) => {
  const enabled = useMemo(() => {
    return (options && options.length > 0) ? true : false
  }, [options])
  
  const values = useMemo (()=>{
    const checkedOption = option ? (options?.find(v => v[valueField] == option) || null) : null
    const _values = (enabled && checkedOption != null) ? [checkedOption] : []
    // console.log ({values: _values})
    return _values
  },[option, options, valueField, enabled])
  
  // console.log ('AutoCompleteSelect', {options, values, option, placeholder, disabled, loading})
  
  return (
     
    <Select
      ref={ref}
      className="react-select-container"
      classNamePrefix={"select2-selection w-100"}
      multi={false}
      options={enabled ?options : []} 
      labelField={labelField} 
      valueField={valueField}
      values={values}
      searchBy={labelField}
      // sortBy={labelField}
      placeholder={placeholder || ""}
      onChange={(values) => {
        if (onChange)
          onChange(values[0])
      }} 
      disabled={disabled || !enabled}
      loading={loading}
    />
  )
})

// export default AutoCompleteSelect
