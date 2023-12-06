import {
  Card,
  Col,
  Form,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Spinner
} from "reactstrap"
import Dropzone from "../../../components/Common/Dropzone.jsx"

import {
  CitySelect,
  FactoryList,
  MachineClassSelect,
} from "components/Common/Select"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getMediaType, getMediaPreview, getMediaUrl } from "./MediaUtils.js"

import "components//modal.scss"
import MediaList from '../components/MediaList.jsx'

const PartEditModal = (props) => {

  const {
    item,
    show,
    toggleModal,
    updateItem,
    createItem,
    edit,
  } = props;

  const [availToCreateItem, setAvailToCreateItem] = useState(false)
  // const [validateMachineclassFactory, setValidateMachineclassFactory] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadingProgress, setUploadingProgress] = useState(0)

  const createItemAction = async (e) => {
    // await updateItem("preview", item.preview)
    createItem((progressEvent) => {
      const { loaded, total } = progressEvent
      let percent = Math.floor((loaded * 100) / total)
      if (percent < 100) {
        setUploadingProgress(percent)
        setUploading(true)
      } else {
        setUploading(false)
        setUploadingProgress(0)
      }
    })
  }

  const updateItemAction = async (f, e) => {
    if (f != null)
      await updateItem(f, e)
  }
  useEffect(() => {
    let enable = true
    let validateMachineClass = false;
    Object.entries(item).map(v => {
      if (v[0] != "preview" && v[0] != "media") {
        if (!v[1]) enable = enable && v[1] !== "" && v[1] !== null
      }
    })
    const rule = {
      "Wire Cage (MBK)": "Pipe And Box",
      "Blizzard": "Precast",
      "Tornado": "Precast",
      "Perfect System": "Precast",
      "Fittings": "Exterior",
    }
    if (item.machineClass && item.factory) {
      if (rule.hasOwnProperty(item.machineClass))
        if (rule[item.machineClass] != item.factory) {
          enable = enable && false;
          validateMachineClass = validateMachineClass || true;
        }
    }
    setAvailToCreateItem(enable)
    // setValidateMachineclassFactory(validateMachineClass)
  }, [item]);

  const [mediaType, setMediaType] = useState()
  const [useVideo, setUseVideo] = useState();

  const [youtube, setYoutube] = useState();

  const toggleUseVideoField = (ev) => {
    setYoutube("")
    setUseVideo(!useVideo);
  }

  const [selectedFiles, setselectedFiles] = useState([])

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  function handleAcceptedFiles(files) {
    files.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
        mimeType: file.type,
      })
    )
    setselectedFiles(files)
  }

  useEffect(() => {
    setMediaType(getMediaType(item.preview))
    setUseVideo(getMediaType(item.preview) == "video")
    setYoutube((getMediaType(item.preview) == "video" || useVideo) ? item.preview.replace("yt:", "") : "")
    setselectedFiles([])
    updateItemAction(null)
  }, [show])

  return (
    <Modal isOpen={show} toggle={toggleModal} className="spec-modal part-modal">
      <ModalHeader toggle={toggleModal}>
        <div className="modal-title-caption">
          {edit ? "EDIT PART/PRODUCT" : "NEW PART/PRODUCT"}
        </div>
        <div className="modal-title-city">
          {item.city}
        </div>
      </ModalHeader>
      <ModalBody>
        <Form className="input-form" onSubmit={e => createItemAction(e)} id="part-form">

          <input type="hidden" name="city" value={item.city} />

          <div className="row general">
            <Label className="col-label">
              Name Id
            </Label>
            <div className="col-input">
              <input
                className="form-control"
                type="text"
                placeholder="Part"
                name="name"
                value={item.name}
                onChange={e => updateItemAction("name", e)}
              />
            </div>
          </div>

          <div className="row general">
            <Label className="col-label">
              Factory
            </Label>
            <div className="col-input">
              <FactoryList
                onChange={e => updateItemAction("factory", e)}
                placeholder="Factory"
                value={item.factory}
              />
            </div>
          </div>

          <div className="row general">
            <Label className="col-label">
              Machine Class
            </Label>
            <div className="col-input">
              <MachineClassSelect
                onChange={e => updateItemAction("machineClass", e)}
                placeholder="Machine Class"
                value={item.machineClass || ""}
                factory={item.factory}
                issearch={false}
              />
              {/* {validateMachineclassFactory == true ? (
                    <code>Your machine class and factory do not match</code>
                  ) : (
                    ""
                  )} */}
            </div>
          </div>

          <div className="d-flex flex-row divider-part">
            <Label>
              New Part Details
            </Label>
            <div className="divider">
              <hr />
            </div>
          </div>

          <div className="small-part-container">
            <div className="d-flex justify-content-between">

              <div className="small-part">
                <div className="d-flex flex-column justify-content-center">
                  <Label className="text-center small">
                    Weight In Lbs
                  </Label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Pounds"
                    name="pounds"
                    value={item.pounds}
                    onChange={e => updateItemAction("pounds", e)}
                  />
                </div>
              </div>
              <div className="small-part">
                <div className="d-flex flex-column justify-content-center">
                  <Label className="text-center small">
                    Time In Seconds
                  </Label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Avg Time"
                    name="avgTime"
                    value={item.avgTime}
                    onChange={e => updateItemAction("avgTime", e)}
                  />
                </div>
              </div>

            </div>

            {useVideo ? (
              <div className="row">
                <Label className="col-4 small" style={{ textAlign: "right" }}>
                  Video:
                </Label>
                <div className="col-8">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Youtube ID here"
                    name="preview"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="row flex-column align-items-center mb-2 media-container">
                <Label className="small text-center">
                  Assign Photos and Video Previews
                </Label>
                <div className="col-12">
                  <Dropzone
                    onDrop={acceptedFiles => {
                      handleAcceptedFiles(acceptedFiles)
                    }}
                    name="media_files"
                  >

                  </Dropzone>
                  <span className="dropzone-helper">
                    photos will be resized under 1mb and videos compressed to 1min at 720p
                  </span>
                  {/* <div className="dropzone-previews" id="file-previews">
                          {selectedFiles.map((f, i) => {
                            return (
                              <Card
                                className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                                key={i + "-file"}
                              >
                                <div className="p-0">
                                  <Row className="align-items-center">
                                    <Col className="col-auto">
                                      <img
                                        data-dz-thumbnail=""
                                        height="80"
                                        className="avatar-sm rounded bg-light"
                                        alt={f.name}
                                        src={f.preview}
                                      />
                                    </Col>
                                    <Col>
                                      <Link
                                        to="#"
                                        className="text-muted font-weight-bold"
                                      >
                                        {f.name}
                                      </Link>
                                      <p className="mb-0">
                                        <strong>{f.formattedSize}</strong>
                                      </p>
                                    </Col>
                                  </Row>
                                </div>
                              </Card>
                            )
                          })}
                        </div> */}
                </div>
              </div>
            )}

            <MediaList items={selectedFiles} edit={true} onDelete={(idx) => idx} onSelect={(idx) => idx} />

            {/* <div className="row flex-row">
                  <Label className="small" style={{ textAlign: "left", width: 'auto' }}>
                      Use Youtube:
                  </Label>
                  <Input type="checkbox" onChange={toggleUseVideoField} checked={useVideo} />
                </div> */}

            <div className="row label-center mb-0" style={{ paddingLeft: '10px', paddingRight: '5px' }}>

              <div className="col-4">
                <Label className="xs text-center">
                  Finish Good Weight
                </Label>
                <input
                  className="form-control m-auto"
                  type="number"
                  // placeholder="Finish Good Weight"
                  name="finishGoodWeight"
                  onChange={e => updateItemAction("finishGoodWeight", e)}
                  value={item.finishGoodWeight}
                  style={{ width: '110px', height: '25px' }}
                />
              </div>

              <div className="col-4">
                <Label className="xs text-center">
                  Cage Weight Scrap
                </Label>
                <input
                  className="form-control m-auto"
                  type="number"
                  // placeholder="Cage Weight Scrap"
                  name="cageWeightScrap"
                  onChange={e => updateItemAction("cageWeightScrap", e)}
                  value={item.cageWeightScrap}
                  style={{ width: '110px', height: '25px' }}
                />
              </div>

              <div className="col-4">
                <Label className="xs text-center">
                  Cage Weight Actuals
                </Label>
                <input
                  className="form-control m-auto"
                  type="number"
                  // placeholder="Cage Weight Actuals"
                  name="cageWeightActuals"
                  onChange={e => updateItemAction("cageWeightActuals", e)}
                  value={item.cageWeightActuals}
                  style={{ width: '110px', height: '25px' }}
                />
              </div>

            </div>

          </div>
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
                {uploadingProgress}% Uploading Photos and Videos
              </div>
            </>
          }
        </div>
        <Button
          color="primary"
          onClick={createItemAction}
          disabled={!availToCreateItem}
        >
          {edit ? "Save" : "Add"}
        </Button>{" "}
        <Button color="secondary" onClick={toggleModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default PartEditModal
