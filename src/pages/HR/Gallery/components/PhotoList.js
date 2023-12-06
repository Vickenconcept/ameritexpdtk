import LightGallery from "lightgallery/react"
import { useEffect, useCallback, useRef, useState, useMemo } from "react"
import "lightgallery/scss/lightgallery.scss"
import "lightgallery/scss/lg-zoom.scss"
import "lightgallery/scss/lg-video.scss"
// import 'lightgallery/scss/lg-thumbnail.scss';
import "./lg-thumbnail.scss"

// import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from "lightgallery/plugins/zoom"
// import lgAutoplay from 'lightgallery/plugins/autoplay';
// import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgFullscreen from "./fullscreen"
import lgPaginating from "./paginating"
import lgThumbnail from "./thumbnail"
import lgVideo from "lightgallery/plugins/video"
// import lgHash from 'lightgallery/plugins/hash';
// import lgPager from 'lightgallery/plugins/pager';
// import lgShare from 'lightgallery/plugins/share';
// import lgRotate from 'lightgallery/plugins/rotate';

import { useModal } from "components/Common/Modal/promise-modal/index.js"
import { ConfirmModal } from "components/Common/Modal/ConfirmModal"

import { BACKEND } from "./helpers/axiosConfig"
import axios from "axios"

export default ({ photos, albumId, lightGalleryRef, galleryRef, zoomOpen, setZoomOpen, onSlide, metadata, onOrderAction, setPhotos, canEdit, onAfterSetCover }) => {
  const lightGallery = useRef(null);

  const { create } = useModal(ConfirmModal, {
    instanceId: "deletePhotosModal",
    title: "Delete photos",
    text: "Are you sure you want to delete those items?",
    confirmText: "Confirm",
    cancelText: "Cancel",
  })

  const confirmDelete = (onConfirm, onCancel, props) => {
    create(props).then(onConfirm).catch(onCancel)
  }

  const onInit = useCallback(data => {
    if (data) {
      lightGallery.current = data.instance
      lightGalleryRef.current = data.instance
      // onOrderAction(null)
    }
  }, [])

  // const [pageData, setPageData] = useState({ index: 0, prevIndex: 0 })

  useEffect(() => {
    if (lightGalleryRef.current && photos) {
      lightGalleryRef.current.refresh()
    }
  }, [photos])

  if (!photos) return []

  const getItems = useCallback(() => {
    return photos.map(item => {
      return (
        <a
          key={item._id}
          data-lg-size={item.size}
          className="gallery-item hidden"
          data-download-url={item.url}
          // data-download-url={BACKEND + '/api/download?url=' + item.url}
          data-src={item.url}
          data-sub-html={item.name}
          data-alt={item._id}
        >
          <img
            style={{ visibility: "hidden" }}
            className="img-responsive"
            src={item.thumb}
            alt={item._id}
          />
        </a>
      )
    })
  }, [photos])

  // function onBeforeSlide(e) {
  // const { index, prevIndex } = e
  // setPageData({ index, prevIndex })
  // }

  async function onOrder(tmp) {
    await onOrderAction(tmp)
    const gallery = lightGalleryRef.current
    gallery.updateSlides(
      gallery.galleryItems,
      gallery.galleryItems.length - 1 - gallery.index
    )
    // gallery.slide( 0 - gallery.settings.index)
  }

  const onAfterOpen = e => {
    setZoomOpen(true)
  }

  const onBeforeClose = () => {
    setZoomOpen(false)
    // lightGalleryRef.current?.destroy()
  }

  async function downloadImage(imageURL, name) {
    // Fetch the image and create a blob
    const urlObj = new URL(imageURL)
    const encodedPath = encodeURIComponent(urlObj.pathname)

    const response = await fetch(imageURL)
    const blob = await response.blob()
    // Create a temporary anchor element and download the image
    const anchor = document.createElement("a")
    anchor.href = URL.createObjectURL(blob)
    anchor.download = name.includes(".")? name : name + ".jpg"
    // Set desired filename here
    anchor.style.display = "none"
    document.body.appendChild(anchor)
    anchor.click()
    // Clean up after download
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(anchor.href), 100)
  }

  const onAfterSlide = useCallback((ev) => {
    const downloadBtn = document.querySelector(".lg-download")
    if (downloadBtn) {
      downloadBtn.onclick = e => {
        e.preventDefault()
        e.stopPropagation()
        const url = e.target.getAttribute("href")
        const {index} = ev
        const name = lightGalleryRef.current.galleryItems[index].subHtml
        downloadImage(url,name)
      }
    }
  },[photos, lightGalleryRef.current])

  const removeAction = useCallback(
    async (ids, cb) => {
      if (!albumId) return
      confirmDelete(
        async () => {
          const url = `/album/${albumId}`
          const data = { deleted_photos: ids }
          try {
            const res = await axios.post(url, data)
            if (!res.data?.success) throw new Error("remove failed")
            setPhotos(prev => {
              let tmp = prev[albumId].filter(item => !ids.includes(item._id))
              return { ...prev, [albumId]: tmp }
            })
            return cb(true)
          } catch (e) {
            console.log(e)
            return cb(false)
          }
        },
        () => {
          return cb(false)
        },
        {
          title: `Delete ${ids.length} Selected Images`,
          text: `Are you sure you want to delete these images?`,
        }
      )
    },
    [albumId, photos, lightGalleryRef.current]
  )

  const setCoverAction = useCallback(async (id, cb) => {
    if (!albumId) return
    confirmDelete (async () => {
      const url = `/album/${albumId}`
      const data = { cover: id }
      try {
        const res = await axios.post(url, data)
        if (!res.data?.success) throw new Error('set cover failed')
        await onAfterSetCover (albumId, res.data?.cover)
        if (cb)
          return cb(res.data?.cover)
      } catch (e) {
        console.log (e)
        if (cb)
          return cb(null)
      }
    }, () => {
      return cb (null)
    },{
      title: `Set Cover Image`,
      text: `Are you sure you want to set this image as album cover?`,
    })
  }, [albumId, photos, lightGalleryRef.current])

  

  // useEffect(() => {
  //   let total_photos = photos?.length
  //   if (!metadata?.total || !albumId || !total_photos) return
  //   let { index, prevIndex } = pageData
  //   if (index >= total_photos - 2 && index < metadata.total) {
  //     onSlide(total_photos)
  //   }
  // }, [pageData])

  useEffect(() => {
    return () => {
      if (lightGalleryRef.current) {
        lightGalleryRef.current.destroy()
        lightGalleryRef.current = null
      }
      setZoomOpen(false)
    }
  }, [])

  const galleryMetadata = useMemo(() => {
    return { ...metadata, albumId }
  }, [metadata, albumId])

  return (
    <LightGallery
      key={`group_${albumId}`}
      onInit={onInit}
      speed={500}
      plugins={[lgThumbnail, lgZoom, lgVideo, lgFullscreen, lgPaginating]}
      animateThumb={true}
      enableThumbDrag={true}
      enableThumbSwipe={true}
      toggleThumb={true}
      allowMediaOverlap={false}
      thumbnail={true}
      licenseKey="101010"
      container={galleryRef.current}
      onAfterOpen={() => {
        onAfterOpen()
      }}
      onBeforeClose={() => {
        onBeforeClose()
      }}
      removeAction={removeAction}
      setCoverAction={setCoverAction}
      // onBeforeSlide={onBeforeSlide}
      loop={true}
      extraProps={[{
        containerId: `album-zoom-inner`,
        metadata: galleryMetadata,
      }]}
      galleryMetadata={galleryMetadata}
      appendCounterTo={null}
      appendThumbnailsTo="lg-outer"
      actualSize={false}
      showZoomInOutIcons={true}
      actualSizeIcons={{ zoomIn: "lg-actual-size", zoomOut: "lg-actual-size" }}
      onOrder={e => onOrder(e)}
      canEdit={canEdit}
      // scale={.33}
      // onBeforeSlide={onBeforeSlide}
      // onAfterNextSlide={onAfterNextSlide}
      // onAfterPrevSlide={onAfterPrevSlide}
      // onBeforeNextSlide={onBeforeNextSlide}
      // onBeforePrevSlide={onBeforePrevSlide}
      // onBeforeOpen={onBeforeOpen}
      // onAfterOpen={onAfterOpen}
      // onBeforeClose={onBeforeClose}
      // onAfterClose={onAfterClose}
      // onDragstart={onDragstart}
      // onDragmove={onDragmove}
      // onDragend={onDragend}
      // onSlideClick={onSlideClick}
      // onBeforeNextSlide={onBeforeNextSlide}
      // onBeforePrevSlide={onBeforePrevSlide}
      onAfterSlide={onAfterSlide}
    >
      {getItems()}
    </LightGallery>
  )
}
