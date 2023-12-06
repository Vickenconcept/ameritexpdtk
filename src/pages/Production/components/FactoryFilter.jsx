export default ({
    style,
    factoryFilters,
    factoryFilter,
    toggleFilter,
    // MISC,
    // setMISC,
    
}) => {
    return (
        <div className="sort-container" style={style}>
            <div className="sort-text">SHOW ONLY</div>
            <div className="d-flex" style={{flexWrap:'wrap'}}>
            {factoryFilters.map((factory, index) => (
                <label
                key={`factory1-${index}`}
                className="sort-factory-category mb-0 chk-container"
                >
                {factory}
                <input
                    type="checkbox"
                    className="form-checkbox"
                    onClick={e => toggleFilter(e, factory)}
                    id={`factory-filter-${factory}`}
                    onChange={() => {}}
                    checked={factoryFilter[index] === true}
                />
                <span className="checkmark"></span>
                </label>
            ))}
            </div>
            {/* <div className="d-flex">
            <label className="sort-factory-category mb-0">
                MISC
                <input
                type="checkbox"
                className="form-checkbox"
                onClick={e => {
                    setMISC(!MISC)
                }}
                onChange={() => {}}
                checked={MISC}
                />
            </label>
            </div> */}
        </div>
    )
}