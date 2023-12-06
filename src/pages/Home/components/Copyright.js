export default (props) => {
  return (
    <div className="text-center mt-3">
      <div className="position-relative d-inline-flex flex-column">
        <div className="text-center">
          © {new Date().getFullYear()} AmeriTex Pipe & Products with 
          {" "}<i className="mdi mdi-heart text-danger"></i> by Ieko Media.
        </div>
      </div>
    </div>
  )
}