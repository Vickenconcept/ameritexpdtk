import { cities, factories, machineClasses, classify, factory2mc, mc2factory } from "../../helpers/globals"
import { useMemo } from "react"

export const CitySelect = props => {
  return (
    <select
      className="form-select"
      {...props}
      name="city"
      onChange={e => props.onChange(e)}
    >
      {props.allowall == "true" ?
        <option value="">
          All Cities
        </option>
        :
        (props.allowAll === undefined ?
          <option value="" disabled>
            {props.placeholder}
          </option>
          :
          <></>)
      }
      {cities.map(city => (
        <option className="text-uppercase" key={"city-" + city} value={city}>
          {city}
        </option>
      ))}
    </select>
  )
}

export const FactoryList = props => {
  const { activeFactories, className, onChange } = props
  const handleChange = (e) => {
    return onChange(e)
  }
  return (
    <select
      {...props}
      className={"form-select " + className}
      name="factory"
      onChange={handleChange}
    >
      {props.allowall == "true" ?
        <option value="">
          All Factories
        </option>
        :
        <option value="" disabled>
          {props.placeholder}
        </option>
      }
      {factories.map(factory => {
        let enabled = (!activeFactories || activeFactories.includes(factory))
        return (
          <option key={"factory-" + factory} value={factory} disabled={!enabled}>
            {factory}
          </option>
        )
      })}
    </select>
  )
}

export const MachineClassSelect = props => {
  const filteredMachineClasses = useMemo(() => {
    let options = []
    if (props.factoryFilter) {
      options = machineClasses.filter(mClass => {
        return props.factoryFilter.includes(mc2factory(mClass))
      })
    }
    if (props.factory) options = factory2mc(props.factory)
    if (props.issearch) {
      options = ["All", ...options]
    }
    return options
    // return machineClasses.filter(mClass => {
    //   return props.activeFactories?.includes(mClass)
    // })
  }, [props.factory, props.activeFactories, props.factoryFilter, props.issearch])
  return (
    <select
      // {...props}
      className={"form-select " + props.className}
      name="machineClass"
      onChange={e => props.onChange(e)}
      value={props.value || ""}
      disabled={props.disabled || filteredMachineClasses?.length == 0}
    >
      <option value="">
        {props.placeholder}
      </option>
      {filteredMachineClasses.map(mClass => (
        <option
          className="text-uppercase"
          key={"m-class-" + props.name + "-" + mClass}
          value={mClass}
        >
          {mClass}
        </option>
      ))}
    </select>
  )
}

export const CityVisualSelect = props => {
  const city = props.value
  const { onChange, activeCities, small } = props
  return (cities.map((_city, index) => (
    <div
      key={"city" + index}
      className="city text-uppercase col-lg-4 col-md-6 "
    >
      <div
        className={`city-selector ${_city == city ? "active" : ""
          } ${activeCities.includes(_city) ? "" : "disabled"
          } ${small ? "small" : ""}
        `}
        onClick={() => {
          if (_city == city) return false
          if (!activeCities.includes(_city)) return false
          onChange(_city)
        }}
      >
        <span className="city-name" style={activeCities.includes(_city) ? {} : { color: '#b2b8bf' }}>{_city}</span>
        <span>
          <i className="mdi mdi-poll"></i>
        </span>
      </div>
      <div
        className="mt-1 d-flex justify-content-end compare"
        style={{ marginRight: "20px" }}
      >
        <span>COMPARE </span>
        <input
          type="checkbox"
          className="form-checkbox ms-2"
          onClick={() => toggleCompare(index)}
        />
      </div>
    </div>
  ))
  )
}
