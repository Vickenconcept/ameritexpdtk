import React from "react"
import "./pagination.scss"

const Pagination = (props) => {

  const { page, movePage, totalPage } = props

  const goToPrevPage = () => {
    if (page > 1)
      movePage(page - 1)
  }

  const goToNextPage = () => {
    if (page < totalPage)
      movePage(page + 1)
  }

  const pageChanged = (e) => {
    if (e.keyCode === 13) {
      const _page = e.target.value
      if (_page > 1 && _page <= totalPage)
        movePage(_page)
    }
  }

  return <div className="pagination d-flex">
    {page > 1 ?
    <div className='pe-0 cursor-pointer' style={{ paddingLeft: '24px' }}>
      <div className='d-flex align-items-center border-end pe-2'
        onClick={goToPrevPage}
      >
        <span className='mdi mdi-chevron-left'></span>
        <span>PREV</span>
      </div>
    </div>
    :
    <div style={{paddingLeft:'50px'}}></div>
    }
    { totalPage && totalPage != 1 &&
    <div className='px-0 cursor-pointer'>
      <div className='d-flex align-items-center border-end px-2 position-relative'>
        {totalPage?page:0}
        <i className='mdi mdi-menu-down' data-bs-toggle="dropdown" aria-expanded="false" id="setpage" ></i>
        <span> of {totalPage}</span>
        <div className='dropdown-menu dropdown-menu-end border-0 p-0' aria-labelledby="setpage" style={{minWidth: 64}}>
          <input className='form-control' type='number'
            onKeyUp={(e) => pageChanged(e)}
            style={{ width: 64 }} />
        </div>
      </div>
    </div>
    }
    {page < totalPage &&
    <div className='px-2 cursor-pointer'>
      <div className='d-flex align-items-center' onClick={goToNextPage}>
        <span>NEXT</span>
        <span className='mdi mdi-chevron-right'></span>
      </div>
    </div>
    }
  </div>
}

export default Pagination