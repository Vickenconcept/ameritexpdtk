import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Fragment,
  forwardRef,
} from "react"
import MetaTags from "react-meta-tags"
import { Container } from "reactstrap"
import "./style.scss"

import { useMemo } from "react"
import PortfolioItem from "./components/PortfolioItem"
import axios from "axios"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import AlbumEditModal from "./components/AlbumModal"
import { useLoading } from "../../../context/loading"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import { BACKEND } from "../../../helpers/axiosConfig"

import PhotoList from "./components/PhotoList"

import { useModal } from "../../../components/Common/Modal/promise-modal/index.jsx"
import { AlertModal } from "../../../components/Common/Modal/AlertModal"
import { ConfirmModal } from "../../../components/Common/Modal/ConfirmModal"

function clearGallery() {
  if (document.querySelector(".lg-backdrop"))
    document.querySelectorAll(".lg-backdrop").forEach(item => item.remove())
  if (document.querySelector(".lg-outer"))
    document.querySelectorAll(".lg-outer").forEach(item => item.remove())
}

function sliceArray(arr1, arr2, skip, size) {
  let arr = [...arr1]
  for (let i = 0; i < size; i++) {
    if (i >= arr2.length) break
    arr[skip + i] = arr2[i]
  }
  return arr
}

const Gallery = props => {
  const [albumLoaded, setAlbumLoaded] = useState(false)
  const [album, setAlbum] = useState()
  const [albums, setAlbums] = useState([])
  const [photos, setPhotos] = useState({})
  const [photosMetadata, setPhotosMetadata] = useState({})
  const [albumIndex, setAlbumIndex] = useState(0)
  const [photoLoaded, setPhotoLoaded] = useState({})
  const [zoomOpen, setZoomOpen] = useState(false)
  const [totalAlbums, setTotalAlbums] = useState(0)

  const { create: createAlert, resolve: resolveAlert } = useModal(AlertModal, {
    instanceId: "alert",
    title: "Alert!",
    text: "Some Information",
    confirmText: "Done",
    showConfirmButton: true,
  })

  const openAlert = (onConfirm, onCancel, props) => {
    createAlert(props).then(onConfirm).catch(onCancel)
  }

  const closeAlert = () => {
    resolveAlert()
  }

  const { create: createConfirm } = useModal(ConfirmModal, {
    instanceId: "confirm",
    title: "Alert!",
    text: "Some Information",
    confirmText: "Yes",
  })

  const confirm = (onConfirm, onCancel, props) => {
    createConfirm(props).then(onConfirm).catch(onCancel)
  }

  const { loading, setLoading } = useLoading()

  const user = props.user
  const canEdit = useMemo(() => (user ? user?.role === "Admin" : false), [user])

  const [modal, setModal] = useState(false)
  const initAlbum = { year: new Date().getFullYear() }

  const [order, setOrder] = useState()

  const onOrderAction = useCallback(
    tmp => {
      // tmp: asc or desc
      if (tmp === null || !photos[albumIndex]) return
      try {
        setPhotos(prev => {
          let _photos = [...prev[albumIndex]]
          if (!tmp)
            _photos = _photos.sort((a, b) => a.name.localeCompare(b.name))
          else _photos = _photos.sort((a, b) => b.name.localeCompare(a.name))
          setPhotos(prev => ({ ...prev, [albumIndex]: _photos }))
        })
      } catch (e) {
        console.log(e)
      }
    },
    [photos, setPhotos, albumIndex]
  )

  async function openModal(id) {
    try {
      setLoading(true)
      if (!id) setAlbum({ ...initAlbum })
      else {
        const res = await axios.get(`/album/${id}/photos?limit=20`)
        const res_album = res.data.album
        const album_photos = res.data.photos
        setAlbum({ ...res_album, photos: album_photos })
      }
      setModal(true)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  const closeModal = () => {
    setModal(false)
  }
  const toggleModal = () => {
    setModal(prev => !prev)
  }

  const deleteItem = async (id, cb) => {
    try {
      const res = await axios.delete(`/album/${id}`)
      if (cb) cb(res.data)
      setAlbums(prev => prev.filter(item => item._id !== id))
    } catch (e) {
      console.log(e)
      if (cb) cb(null)
    } finally {
      // loadItems()
    }
  }

  const loadAlbums = async (skip = 0, size = 6, cb) => {
    try {
      setAlbumLoading(true)
      const res = await axios.get(`/album/albums?limit=${size}&skip=${skip}`)
      if (!res.data.albums) return null
      if (skip === 0) setAlbums(res.data.albums)
      else setAlbums(prev => sliceArray(prev, res.data.albums, skip, size))
      if (cb) cb(res.data.albums)
      setTotalAlbums(res.data.totalDocs)
      return res.data.albums
    } catch {
      console.log(e)
      return null
    } finally {
      setAlbumLoading(false)
    }
  }

  const loadItems = async cb => {
    try {
      setLoading(true)
      setAlbumLoaded(false)
      // setPhotos({})
      await loadAlbums(0, 48)
      setLoading(false)
    } catch (e) {
      console.log(e)
    } finally {
      setAlbumLoaded(true)
      setLoading(false)
    }
  }

  const loadPhotos = async (id, cb, skip = 0, size = 20, order = "asc") => {
    try {
      if (skip == 0) {
        setPhotoLoaded(prev => ({ ...prev, [id]: false }))
      }
      // setPhotos (prev=>({...prev, [id]:[]}))
      const res = await axios.get(
        `/album/${id}/photos?limit=${size}&skip=${skip}&order=${order}`
      )
      const tmp = res.data.photos
      const total_cnt = res.data.totalDocs
      const _album = res.data.album
      if (tmp.length !== 0) {
        if (skip !== 0)
          setPhotos(prev => ({
            ...prev,
            [id]: sliceArray(prev[id], tmp, skip, size),
          }))
        else setPhotos(prev => ({ ...prev, [id]: tmp }))
      }
      if (total_cnt)
        setPhotosMetadata(prev => ({
          ...prev,
          [id]: {
            total: total_cnt,
            name: _album?.name,
            year: _album?.year,
            cover: _album?.cover,
            _id: _album?._id,
          },
        }))
      setPhotoLoaded(prev => ({ ...prev, [id]: true }))
      if (cb !== undefined) cb(tmp)
    } catch (e) {
      console.log(e)
    } finally {
      // setPhotoLoaded (prev=>({...prev, [id]:true}))
      // if (cb !== undefined)
      //   cb (id)
    }
  }

  const onLoadItem = async (id, cb) => {
    setLoading(true)
    try {
      if (!photoLoaded[id]) await loadPhotos(id, cb)
      if (cb !== undefined) cb(id)
      setLoading(false)
      setAlbumIndex(id)
      const _album = albums.find(item => item._id === id)
      setAlbum({ ..._album })
    } catch (e) {
      setLoading(false)
      setAlbumIndex(null)
    } finally {
    }
  }

  const onSlide = useCallback(
    async total_photos => {
      try {
        // console.log (total_photos)
        // if (index === total_photos - 1 && prevIndex === total_photos - 2) {
        // console.log("load more", albumIndex)
        // await loadPhotos(albumIndex, undefined, total_photos, 20, order)
        // }
      } catch (e) {
        console.log(e)
      }
    },
    [photos, albumIndex, order]
  )

  useEffect(async () => {
    if (loading) return
    clearGallery()
    await loadItems()
    return () => {
      clearGallery()
    }
  }, [])

  useEffect(() => {
    if (albumIndex && order) {
      loadPhotos(albumIndex, undefined, 0, 20, order)
    }
  }, [order])

  // useEffect (async ()=>{
  //   if (albumLoaded) {
  //       albums.map (async album=>{
  //         loadPhotos (album._id)
  //     })
  //   }
  // },[albumLoaded])

  const yearsFilter = useMemo(() => {
    if (!albumLoaded) return []
    if (!albums) return []
    const years = []
    try {
      // albums.map (album=>{
      //   if (!isNaN (Date.parse (album.createdAt))) {
      //     let createdAt = new Date (album.createdAt)
      //     let year = createdAt.getFullYear()
      //     if (!years.includes (year) && !isNaN(year)) years.push (year)
      //   }
      // })
      albums.map(album => {
        if (!years.includes(album.year)) years.push(album.year)
        // if (!isNaN (Date.parse (album.createdAt))) {
        //   let createdAt = new Date (album.createdAt)
        //   let year = createdAt.getFullYear()
        //   if (!years.includes (year) && !isNaN(year)) years.push (year)
        // }
      })
    } catch (e) {
      console.log(e)
    } finally {
      return years.sort((a, b) => b - a)
    }
  }, [albums, albumLoaded])

  const [filter, setFilter] = useState({})

  const isFiltering = useMemo(() => {
    return filter.name || (filter.year && filter.year != "")
  }, [filter])

  const onResetFilter = () => {
    setReordering(false)
    setFilter({})
    loadItems()
  }

  const onChangeFilter = e => {
    if (reordering) return false
    setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const albumsFiltered = useMemo(() => {
    let filterByName, filterByYear
    if (!albums) return []
    if (!isFiltering) return albums
    return albums.filter(album => {
      filterByYear = true
      if (filter.year === "all" || filter.year == "" || !filter.year)
        filterByYear = true
      else if (!isNaN(parseInt(filter.year))) {
        // if (!isNaN(Date.parse(album.createdAt))) {
        //   let createdAt = new Date(album.createdAt)
        //   let year = createdAt.getFullYear()
        //   if (parseInt(year) != parseInt(filter.year)) return false
        // }
        if (parseInt(filter.year) != album.year) return false
      }
      if (!filterByYear) return false
      if (!filter.name) return true
      if (filter.name.trim() == "") return filterByYear
      else {
        filterByName = album.name
          .toLowerCase()
          .includes(filter.name.toLowerCase())
      }
      return filterByName && filterByYear
    })
  }, [albums, isFiltering, filter])

  const lightGalleryRef = useRef()
  const AlbumComponent = useCallback(
    ({ album }) => {
      const albumId = album._id
      return (
        <PortfolioItem
          key={albumId}
          image={
            album.cover && album.cover.thumb
              ? album.cover.thumb
              : "/placeholder.png"
          }
          thumb={
            album.cover && album.cover.thumb
              ? album.cover.thumb
              : "/placeholder.png"
          }
          group={"albums"}
          visible={true}
          name={album.name}
          photo={null}
          album={album}
          ready={photoLoaded[albumId]}
          canEdit={canEdit}
          openModal={openModal}
          deleteItem={deleteItem}
          loadItem={onLoadItem}
          photo_cnt={album.photo_cnt}
          lightGalleryRef={lightGalleryRef}
          setZoomOpen={setZoomOpen}
          zoomOpen={zoomOpen}
          ref={lastAlbumElementRef}
        />
      )
    },
    [
      // albums,
      // photos,
      // photoLoaded,
      canEdit,
      openModal,
      deleteItem,
      // lightGalleryRef,
      // lightGalleryRef,
    ]
  )

  const [reordering, setReordering] = useState(false)

  const onReorder = e => {
    setFilter({})
    setReordering(prev => !prev)
  }

  const onReorderCancel = e => {
    setReordering(false)
    setAlbums(prev => {
      let temp = prev.sort((a, b) => a.order - b.order)
      return [...temp]
    })
  }

  const onSortABC = e => {
    setAlbums(prev => {
      let temp = prev.sort((a, b) => a.name.localeCompare(b.name))
      return [...temp]
    })
  }

  const onSortTime = () => {
    setReordering(true)
    setAlbums(prev => {
      let temp = prev.sort((a, b) => {
        if (!a.updatedAt) return 1
        if (!b.updatedAt) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
      return [...temp]
    })
  }

  const onReorderSave = useCallback(async e => {
    confirm(async () => {
      try {
        setReordering(false)
        setLoading(true)
        const postData = albums.map((album, idx) => ({
          _id: album._id,
          order: idx,
        }))
        openAlert(() => { }, () => { }, {
          title: 'Reordering Albums',
          text: 'Reordering albums, please wait...',
          showConfirmButton: false,
        })
        const res = await axios.put("/album/reorder", { albums: postData })
        setLoading(false)
        closeAlert()
        if (res.data.success) {
          setTimeout(() => {
            openAlert(async () => {
              await loadItems()
            },
              () => {

              },
              {
                title: 'Reorder Success',
                text: 'Galleries are reordered successfully',
                confirmText: 'Done',
              }
            )
          }, 1000)
        }
      } catch (e) {
        console.log(e)
        openAlert(() => {
          setReordering(true)
        },
          () => {

          },
          {
            title: 'Reorder Failed',
            text: 'Failed to reorder galleries',
            confirmText: 'Done',
          }
        )
      } finally {
        // setLoading(false)
      }
    },
      () => { },
      {
        title: 'Reorder Albums',
        text: 'Are you sure you want to reorder albums?'
      }
    )
  }, [albums])

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setAlbums(prev => reorder(prev, oldIndex, newIndex))
  }

  const AlbumItem = useCallback(
    ({ value }) => {
      return (
        <div
          key={"album_" + value._id}
          className="col-12 col-sm-6 col-lg-4 col-xl-4 col-xxl-4 album-grid-component"
        >
          <AlbumComponent album={value} />
        </div>
      )
    },
    [AlbumComponent]
  )

  const SortableItem = useMemo(
    () =>
      SortableElement(({ value }) => {
        return <AlbumItem value={value} />
      }),
    [AlbumItem]
  )

  const SortableList = SortableContainer(({ items }) => {
    return (
      <div className="row album-list-container">
        {items.map((value, index) => (
          <SortableItem
            disabled={!reordering}
            key={`item-${value._id}`}
            index={index}
            value={value}
          />
        ))}
      </div>
    )
  })

  const galleryRef = useRef()

  const [albumLoading, setAlbumLoading] = useState(false)
  const observer = useRef()
  const lastAlbumElementRef = useCallback(
    node => {
      if (albumLoading || reordering || isFiltering) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && albums.length < totalAlbums) {
          loadAlbums(albums.length, 100)
        }
      })
      if (node) observer.current.observe(node)
    },
    [
      albumLoading,
      reordering,
      albums,
      order,
      isFiltering,
      totalAlbums,
      loadAlbums,
    ]
  )

  const onAfterSetCover = (id, cover) => {
    try {
      setAlbums(prev => {
        let temp = [...prev]
        let idx = temp.findIndex((item) => item._id === id)
        if (idx > -1) {
          temp[idx].cover = cover
          return temp
        }
        return prev
      })
      setPhotosMetadata(prev => {
        let temp = { ...prev }
        if (!temp[id]) temp[id] = {}
        temp[id].cover = cover
        return temp
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="page-content adt">
      <MetaTags>
        <title>Gallery</title>
      </MetaTags>
      <Container fluid>
        {modal && canEdit && (
          <AlbumEditModal
            show={modal}
            toggleModal={toggleModal}
            item={album}
            reload={loadItems}
          />
        )}
        <div className="adt-page-container mt-5 w-100">
          <div className="p-0 m-0 w-100">
            <div className="d-flex justify-content-between page-content-header adt-page-header">
              <div>
                <h2>Image Gallery</h2>
                <div className="sub-menu text-uppercase">
                  <span className="parent">Human Resources</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="d-flex flex-column align-items-center border-left-right px-4">
                  <h3 className="mb-0">
                    {/* {albumsFiltered.length == totalAlbums ? '': `${albumsFiltered.length}/` } */}
                    {totalAlbums}
                  </h3>
                  <div className="text-black-50">Galleries </div>
                </div>
                {canEdit && (
                  <button
                    className="btn btn-new ms-3"
                    style={{ backgroundColor: "#3E5B84" }}
                    onClick={() => {
                      openModal()
                    }}
                  >
                    NEW GALLERY
                  </button>
                )}
              </div>
            </div>
            <div className="divide-line d-flex align-items-center pt-3">
              <div className="line"></div>
            </div>
          </div>
          <div className="search-container mt-3">
            <div
              className="search-box row"
              style={{ padding: "1rem 1rem 1rem 1.5rem" }}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <select
                    className={"form-select"}
                    style={{ width: "300px" }}
                    name="year"
                    onChange={onChangeFilter}
                    value={filter.year || ""}
                  >
                    <option value="">All Years</option>
                    {yearsFilter.map(year => (
                      <option
                        className="text-uppercase"
                        key={"m-class-" + year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex">
                  <input
                    className="form-control"
                    placeholder="Search Galleries"
                    value={filter.name || ""}
                    name="name"
                    onChange={onChangeFilter}
                  ></input>
                  <input style={{ margin: "40px", position: "absolute", opacity: "0.0" }} />
                  <a
                    className="btn btn-primary ml-2"
                    onClick={onResetFilter}
                    style={{ backgroundColor: "#3E5B84", marginLeft: "5px" }}
                  >
                    <i className="mdi mdi-reload"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{ position: "relative" }}
            className={`gallery-container ${reordering ? "active" : ""}`}
          >
            {canEdit && albums.length === totalAlbums && (
              <div className="action-container">
                {reordering && (
                  <a className="btn btn-action-save" onClick={onReorderSave}>
                    <i className="fa fa-check"></i>
                  </a>
                )}
                {reordering && (
                  <div className="drag-helper">Drag and drop to reorder</div>
                )}
                {/* {reordering && (
                  <a className="btn btn-action-shuffle" onClick={onSortTime}>
                    <i className="mdi mdi-calendar"></i>
                  </a>
                )}
                {reordering && (
                  <a className="btn btn-action-shuffle" onClick={onSortABC}>
                    <i className="mdi mdi-sort-alphabetical-ascending"></i>
                  </a>
                )} */}
                {!reordering && (
                  <a className="btn btn-action-shuffle" onClick={onReorder}>
                    <i className="mdi mdi-shuffle-variant"></i>
                  </a>
                )}
                {reordering && (
                  <a
                    className="btn btn-action-cancel"
                    onClick={onReorderCancel}
                  >
                    <i className="fa fa-times"></i>
                  </a>
                )}
              </div>
            )}
            {albumLoaded && (
              <>
                <SortableList
                  items={albumsFiltered}
                  onSortEnd={onSortEnd}
                  axis="xy"
                />
                {photos && (
                  <PhotoList
                    albumId={albumIndex}
                    album={album}
                    photos={photoLoaded[albumIndex] ? photos[albumIndex] : []}
                    lightGalleryRef={lightGalleryRef}
                    galleryRef={galleryRef}
                    zoomOpen={zoomOpen}
                    setZoomOpen={setZoomOpen}
                    onSlide={e => onSlide(e)}
                    metadata={photosMetadata[albumIndex] || null}
                    onOrderAction={onOrderAction}
                    onAfterSetCover={onAfterSetCover}
                    setPhotos={setPhotos}
                    canEdit={canEdit}
                  />
                )}
              </>
            )}
          </div>

          <div
            id="album-zoom-container"
            className={`${zoomOpen ? "active" : ""}`}
          >
            <div
              className="album-zoom-inner"
              id="album-zoom-inner"
              ref={galleryRef}
            ></div>
          </div>
        </div>
      </Container>
    </div>
  )
}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps, {})(Gallery))
