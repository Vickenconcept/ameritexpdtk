import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  Label,
  Input,
  Form,
  Spinner
} from "reactstrap"
import Dropzone from "components/Common/Dropzone"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import "components/modal.scss"
import axios from "axios"
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { formatBytes } from "helpers/functions"
import PhotoItem from "./PhotoItem.jsx"
import { useModal } from "../../../../components/Common/Modal/promise-modal/index.js"
import { AlertModal } from "../../../../components/Common/Modal/AlertModal"
import { ConfirmModal } from "../../../../components/Common/Modal/ConfirmModal"

import { FILE_BACKEND } from "../../../../helpers/axiosConfig.js"

const AlbumEditModal = (props) => {

  const { item, show, toggleModal, reload } = props
  const edit = useMemo(() => item._id ? true : false, [item])

  const [uploading, setUploading] = useState(false)
  const [uploadingProgress, setUploadingProgress] = useState(0)
  const [instance, setInstance] = useState({ ...item })

  const [uploadingText, setUploadingText] = useState('')

  const [changed, setChanged] = useState(false)

  const { create: createAlert } = useModal(AlertModal, {
    instanceId: "alert",
    title: "Alert!",
    text: "Some Information",
    confirmText: "OK",
    showConfirmButton: true,
  })

  const alert = (text) => {
    setTimeout(() => {
      createAlert({ text }).then(() => { }).catch(() => { })
    }, 1000)
  }

  const { create: createConfirm } = useModal(ConfirmModal, {
    instanceId: "confirm",
    title: "Confirm!",
    text: "Some Information",
    confirmText: "Confirm",
    cancelText: "Cancel",
  })

  const confirm = (onConfirm, onCancel, props) => {
    createConfirm(props).then(onConfirm).catch(onCancel)
  }

  const updatingPhotos2Post = useCallback(() => {
    if (!edit) return []
    if (!instance.photos || !instance.photos.length) return []
    let tmp = instance.photos.filter((photo, idx) => {
      return (!photo.removed && (photo.modified || photo.reordered))
    })
    return (tmp.map(item => ({
      _id: item._id,
      id: item.index,
      name: item.name,
      context: item.context,
    })))
  }, [instance])

  const [uploadingPhotos, setUploadingPhotos] = useState([])
  const [uploadingData, setUploadingData] = useState([])

  const thisYear = useMemo(() => new Date().getFullYear(), [])

  const selectedFiles = useMemo(() => uploadingPhotos.map((file, idx) => ({
    name: uploadingData.length > idx && uploadingData[idx] || file.name,
    thumb: file.type.includes('image/') ? URL.createObjectURL(file) : '',
    tag: formatBytes(file.size),
    mimeType: file.type,
    id: idx,
  })), [uploadingPhotos, uploadingData])

  const updateItemAction = async (e) => {
    setChanged(true)
    setInstance(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const createItemAction = useCallback(async (e) => {
    e.preventDefault()
    if (!document.getElementById('album-form')) return
    if (!availToCreateItem) return

    confirm(async () => {
      setUploading(true)
      setUploadingProgress(0)
      let url = '/album'
      if (edit) url += `/${instance._id}`
      const formData = new FormData()
      const uploadingForm = []
      const updatingForm = []
      if (changed) {
        formData.append('name', instance.name)
        formData.append('year', instance.year)
      }
      if (edit) formData.append('_id', instance._id)
      if (instance.photos)
        instance.photos.forEach(photo => {
          if (photo.removed)
            formData.append('deleted_photos', photo._id)
        })

      if (uploadingPhotos) {
        for (let i = 0; i < uploadingPhotos.length; i += 10) {
          let tmp = uploadingPhotos.slice(i, i + 10)
          let tmp_meta = []
          if (selectedFiles) {
            tmp_meta = selectedFiles.slice(i, i + 10)
          }
          let fileForm = new FormData()
          let updateForm = new FormData()
          tmp.forEach((file, idx) => {
            fileForm.append(`photos[]`, file)
            updateForm.append('new_photos[]', JSON.stringify(tmp_meta[idx]))
          })
          uploadingForm.push(fileForm)
          updatingForm.push(updateForm)
        }
      }
      let updating = updatingPhotos2Post()
      if (updating != null) {
        updating.forEach(
          photo => {
            formData.append('update_photos[]', JSON.stringify(photo))
          }
        )
      }
      try {
        setUploadingText(edit ? 'Updating context...' : 'Creating new...')
        const res = await axios.post(url, formData, {
          // onUploadProgress: handleUploadProgress
        })
        if (!res.data.success) {
          setUploadingText(edit ? 'Failed to update context' : 'Failed to create new gallery')
          alert(res.data.message)
          return
        }
        setUploadingText(edit ? 'Uploading photos...' : 'Uploading photos...')
        let { _id, name } = res.data
        for (let i = 0; i < uploadingForm.length; i++) {
          uploadingForm[i].append('_id', _id)
          uploadingForm[i].append('name', name)
          const resUploading = await axios.post(`${FILE_BACKEND}index1.php`, uploadingForm[i], {
            // onUploadProgress: handleUploadProgress
          })
          if (!resUploading.data.success) {
            setUploadingText(edit ? 'Failed to update context' : 'Failed to create new gallery')
            alert(resUploading.data.message || "Error on uploading")
            return
          }
          const photos = resUploading.data.photos // [{url, thumb, name},{url, thumb, name},{url, thumb, name}...]
          const resUpdating = await axios.post(edit ? url : `${url}/${_id}`, { photos, _id }, {
            // onUploadProgress: handleUploadProgress
          })
          setUploadingText(`Uploaded ${(i + 1) * 10} of ${uploadingPhotos.length}`)
          setUploadingProgress(parseInt(1000 * (i + 1) / uploadingPhotos.length))
        }
      } catch (e) {
        console.log(e.response.status, e.response.data)
        alert(e.response.data.message || 'Failed to create album')
      } finally {
        setUploading(false)
        setUploadingProgress(0)
        toggleModal()
        reload()
      }
    }, () => {

    }, {
      title: edit ? `Update Gallery` : `Create New Gallery`,
      text: edit ? `Continue to update album  ${instance?.name}` : `Continue to create new album  ${instance?.name}`,
      confirmText: edit ? 'Continue' : 'Continue',
      cancelText: 'Cancel',
    })
  }, [instance, changed, uploadingPhotos, uploadingData, edit, updatingPhotos2Post, reload])

  const deleteItemAction = async () => {
    confirm(async () => {
      try {
        const res = await axios.delete(`/album/${instance._id}`)
      } catch (e) {
        console.log(e.response.status, e.response.data)
        alert(e.response.data.message || 'Failed to delete album')
      } finally {
        toggleModal()
        reload()
      }
    }, () => { }, {
      title: 'Delete Album',
      text: 'Are you sure to delete this album?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
  }

  const handleUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    setUploadingProgress(percentCompleted)
  }

  const handleAcceptedFiles = files => {
    setUploadingPhotos(prev => [...prev, ...files])
  }

  const removeUploadingPhoto = (index) => {
    setUploadingPhotos(prev => {
      const tmp = [...prev]
      tmp.splice(index, 1)
      return tmp
    })
  }

  const removeUploadedPhoto = (index, action = true) => {
    try {
      setInstance(prev => {
        const tmp = { ...prev }
        tmp.photos[index].removed = action
        return tmp
      })
    } catch (e) {
      console.log(e)
    }
  }

  const updateUploadedPhoto = (index, field, value) => {
    try {
      setInstance(prev => {
        const tmp = { ...prev }
        tmp.photos[index][field] = value
        tmp.photos[index].modified = true
        return tmp
      })
    } catch (e) {
      console.log(e)
    }
  }

  const getOriginalPhoto = useCallback((index) => {
    try {
      return item.photos[index]
    } catch (e) {
      console.log(e)
    }
  }, [item])

  const redoUploadedPhoto = (index) => {
    try {
      setInstance(prev => {
        const tmp = { ...prev }
        tmp.photos[index] = { ...getOriginalPhoto(index) }
        tmp.photos[index].modified = false
        return tmp
      })
      let photo_id = instance.photos[index]._id
    } catch (e) {
      console.log(e)
    }
  }

  const updateUploadingPhoto = (index, field, value) => {
    try {
      // setUpdatingData (prev=>{
      //   if (prev.length <= index) return prev
      //   const tmp = [...prev]
      //   tmp[index] = {...tmp[index], [field]:value}
      //   return tmp
      // })
    } catch (e) {
      console.log(e)
    }
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = [...list]
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const [reordering, setReordering] = useState(false)

  const onSortStart = () => {
    setReordering(true)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setReordering(true)
    setInstance(prev => {
      const tmp = { ...prev }
      tmp.photos = reorder(tmp.photos, oldIndex, newIndex)
      return tmp
    })
  }

  const onSortCancel = () => {
    setReordering(false)
    setInstance(prev => {
      const tmp = { ...prev }
      const _photos = tmp.photos.sort((a, b) => a.id - b.id)
      _photos.map((photo, idx) => {
        photo.id = idx + 1
        photo.reordered = false
      })
      tmp.photos = _photos
      return tmp
    })
  }

  const onSortABC = () => {
    setReordering(true)
    setInstance(prev => {
      const tmp = { ...prev }
      tmp.photos.sort((a, b) => a.name.localeCompare(b.name))
      return tmp
    })
  }

  const onSortTime = () => {
    setReordering(true)
    setInstance(prev => {
      const tmp = { ...prev }
      tmp.photos.sort((a, b) => {
        if (!a.updatedAt) return 1
        if (!b.updatedAt) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      })
      return tmp
    })
  }

  const onSortSave = () => {
    setReordering(false)
    setInstance(prev => {
      const tmp = { ...prev }
      tmp.photos.map((photo, idx) => {
        photo.reordered = false
        updateUploadedPhoto(idx, 'index', idx + 1)
        updateUploadedPhoto(idx, 'reordered', true)
      })
      return tmp
    })
  }

  const SortableItem = SortableElement(({ value, idx }) => (
    <PhotoItem
      key={`photo_existing_${value._id}_${idx}`}
      name={value.name}
      image={value.thumb}
      tag={value.url}
      removed={value.removed}
      modified={value.modified}
      idx={idx}
      removeItem={removeUploadedPhoto}
      updateItem={updateUploadedPhoto}
      redoItem={redoUploadedPhoto}
      edit={!reordering}
    />
  )
  )

  const SortableList = SortableContainer(({ items, disabled }) => {
    return (
      <div className={`row photos-list-container ${disabled ? '' : 'active'}`}>
        {items && items.map((value, index) => (
          <SortableItem disabled={disabled} key={`item-${value?._id}`} idx={index} index={index} value={value} />
        ))}
      </div>
    );
  });

  const availToCreateItem = useMemo(() => {
    return (instance.name && instance.year) &&
      (changed || uploadingPhotos.length)
  }, [instance, changed, uploadingPhotos])

  useEffect(() => {
    if (!instance) return
    if (!instance.year) {
      setInstance(prev => {
        const tmp = { ...prev }
        tmp.year = new Date().getFullYear()
        return tmp
      })
    }
  }, [instance])

  return (
    <Modal isOpen={show} toggle={toggleModal} className="spec-modal album-modal">
      <ModalHeader toggle={toggleModal}>
        <div className="modal-title-caption">
          {edit ? "EDIT GALLERY" : "NEW GALLERY"}
        </div>
        <div className="modal-title-city">
          GALLERY
        </div>
      </ModalHeader>
      <ModalBody>
        <Form
          className="input-form"
          onSubmit={e => createItemAction(e)}
          id="album-form"
        >
          {edit &&
            <input type="hidden" name="_id" value={instance._id} disabled={uploading} />
          }

          <div className="row general mb-1">
            <Label className="col-label">
              Year
            </Label>
            <div className="col-input">
              <input
                className="form-control"
                type="number"
                min={1900}
                max={2100}
                placeholder="Year"
                name="year"
                value={instance.year || thisYear}
                onChange={e => updateItemAction(e)}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="row general mb-1">
            <Label className="col-label">
              Name
            </Label>
            <div className="col-input">
              <input
                className="form-control"
                type="text"
                placeholder="Gallery Name"
                name="name"
                value={instance.name || ""}
                onChange={e => updateItemAction(e)}
              />
            </div>
          </div>

          <div className="d-flex flex-row divider-break">
            <h3>
              Upload Photos
            </h3>
          </div>

          <Dropzone
            onDrop={acceptedFiles => {
              handleAcceptedFiles(acceptedFiles)
            }}
            name="photos"
            types={['image/jpeg', 'image/png']}
          />
          {selectedFiles && selectedFiles.length > 0 &&
            <div className="dropzone-previews" id="file-previews">
              <div className="d-flex flex-row divider-break"></div>
              {selectedFiles.map((f, i) => {
                return (
                  <PhotoItem
                    key={`photo_uploading_${i}`}
                    name={f.name}
                    image={f.thumb}
                    tag={f.tag}
                    idx={i}
                    removeItem={() => removeUploadingPhoto(i)}
                    updateItem={updateUploadingPhoto}
                    uploading={true}
                  />
                )
              })}
            </div>
          }

          {(false && edit) && <>
            {instance.photos && instance.photos.length > 0 &&
              <div className="d-flex flex-row divider-break">
                <h3>
                  Photos ({instance.photos.length})
                </h3>
                {instance?.photos?.length > 1 &&
                  <div className="actions-container">
                    {reordering &&
                      <a className="btn btn-action btn-save" onClick={onSortSave}>
                        <i className='mdi mdi-check'></i>
                      </a>
                    }
                    {reordering &&
                      <a className="btn btn-action btn-sort" onClick={onSortTime}>
                        <i className="mdi mdi-calendar"></i>
                      </a>
                    }
                    {reordering &&
                      <a className="btn btn-action btn-sort" onClick={onSortABC}>
                        <i className="mdi mdi-sort-alphabetical-ascending"></i>
                      </a>
                    }
                    {reordering ?
                      <a className="btn btn-action btn-cancel" onClick={onSortCancel}>
                        <i className='mdi mdi-close'></i>
                      </a>
                      :
                      <a className="btn btn-action btn-start" onClick={onSortStart}>
                        <i className='mdi mdi-shuffle'></i>
                      </a>
                    }
                  </div>
                }
              </div>
            }
            <div className="dropzone-preview">
              <SortableList disabled={!reordering} items={instance.photos} onSortEnd={onSortEnd} />
            </div>
          </>}
        </Form>
      </ModalBody>
      <ModalFooter>
        <div className="loading-container">
          {uploading &&
            <>
              <div className="loading-indicator">
                <Spinner color="primary" />
              </div>
              <div className="loading-text">
                {uploadingProgress}% {uploadingText}
              </div>
            </>
          }
        </div>
        <Button
          color="primary"
          onClick={createItemAction}
          disabled={uploading || !availToCreateItem}
        >
          {edit ? "Save" : "Create"}
        </Button>{" "}
        <Button color="secondary" onClick={toggleModal} disabled={uploading}>
          Cancel
        </Button>
        {edit &&
          <Button color="danger" onClick={deleteItemAction} disabled={uploading}>
            Remove
          </Button>
        }
      </ModalFooter>
    </Modal>
  )
}

export default AlbumEditModal
