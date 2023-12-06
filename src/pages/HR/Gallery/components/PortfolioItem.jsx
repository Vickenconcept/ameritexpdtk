import { Link } from "react-router-dom"
import {
  Spinner,
} from "reactstrap"
import LightgalleryItem from "./LightgalleryItem";
import { useCallback, useEffect, useState, forwardRef } from "react";

import { useModal } from "../../../../components/Common/Modal/promise-modal/index"
import { AlertModal } from "../../../../components/Common/Modal/AlertModal"
import { ConfirmModal } from "../../../../components/Common/Modal/ConfirmModal"

const PortfolioItem = forwardRef(({
  image,
  thumb,
  group,
  visible,
  photo, //null: it means that it's the album element
  album,
  canEdit,
  openModal,
  deleteItem,
  loadItem,
  name,
  setZoomOpen,
  zoomOpen,
  lightGalleryRef,
}, ref) => {
  // const { openGallery } = useLightgallery();
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [loadCnt, setLoadCnt] = useState(0)

  const { create: createAlert } = useModal(AlertModal, {
    instanceId: "alert",
    title: "Alert!",
    text: "Some Information",
    confirmText: "OK",
  })

  const alert = (text) => {
    createAlert({ text }).then(() => { }).catch(() => { })
  }

  const onAlbumClick = async () => {
    try {
      if (photo || loading) return
      if (!album.photo_cnt) return alert('No available photos in this album')
      if (loadItem === undefined) return
      setLoading(true)
      await loadItem(album._id)
      if (lightGalleryRef.current) {
        lightGalleryRef.current.init()
        lightGalleryRef.current.openGallery()
      }
      setLoading(false)
    } catch (e) {
      console.log(e)
      setLoading(false)
    } finally {
    }
  }

  function onEditClick(e) {
    e.stopPropagation()
    e.preventDefault()
    if (loading) return
    if (openModal !== undefined)
      openModal(album._id)
  }

  const onDeleteClick = () => {
    if (photo || loading) return
    if (deleteItem !== undefined) {
      if (!window.confirm('Are you sure you want to delete this album?')) return
      return deleteItem(album._id, (res) => {
        if (res && res.success) {
          alert('Delete success')
        } else {
          alert('Delete failed')
        }
      })
    }
  }

  return (
    // <div style={{display: visible?"":"none"}} onClick={onAlbumClick}>
    <div ref={ref} className={`album-container ${(loading) ? 'loading' : ''}`}>
      {
        // <LightgalleryItem group={group} src={image} thumb={thumb} subHtml={`${name}`}>
        <div className="react_lightgallery_item">
          <img src={thumb} style={{ width: "100%" }} alt='image' className={`light-gallery-item ${loading ? 'blur' : ''}`} />
        </div>
        // </LightgalleryItem>
      }
      {!photo &&
        <div className="album-overlay" onClick={onAlbumClick}>
          <div className="button-container">
            <button className="btn btn-action btn-sm">
              <i className="mdi mdi-layers"></i>
              {album.photo_cnt}
            </button>
            {canEdit && <>
              <button className="btn btn-action btn-sm" onClick={onEditClick}>
                <i className="fa fa-edit"></i>
              </button>
            </>
            }
          </div>
        </div>
      }
      {loading &&
        <div className='loading-indicator'>
          <Spinner color='light' animation="border" variant="primary" />
        </div>
      }
      {photo &&
        <div id={`photo_info_${photo._id}`}>{photo.name}</div>
      }
      {!photo && <>
        <div id={`album_info_${album._id}`} className="album-banner">
          <span className='album-banner-year'>{album.year}</span>
          <br />
          {album.name}
        </div>
      </>}
    </div>
    // {/* </div> */}
  )
})

export default PortfolioItem
