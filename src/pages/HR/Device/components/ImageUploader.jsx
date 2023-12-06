import { useState, useRef } from "react";

export default ({
    onChange,
    maxSize,
    extension,
    url = '',
}) => {

    const [src, setSrc] = useState (url)
    // const [value, setValue] = useState ()
    const imageRef = useRef()
    const inputRef = useRef()

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.split('/')[0] != 'image') {
                return alert(`File type is not allowed, allowed type is image`)
            }
            if (maxSize && file.size > maxSize) {
                return alert(`File size is too big, maximum size is ${maxSize / 1024 / 1024} MB`)
            }
            if (extension && !extension.includes(file.name.split('.').pop())) {
                return alert(`File extension is not allowed, allowed extension is ${extension.join(', ')}`)
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSrc (reader.result)
                // setValue (file)
                onChange (file)
                // onChange({
                //     name: file.name,
                //     type: file.type,
                //     size: file.size,
                //     // base64: reader.result,
                //     file
                // })
            }
            reader.readAsDataURL(file)
        }
    }

    const reset = () => {
        setSrc (url)
        // setValue ()
        onChange (null)
    }

    return (
        <div id='device-image-uploader' >
            <div className="action-container">
                <button className="btn-icon action action-upload" onClick={()=>{
                    inputRef.current.click()
                }}>
                    <i className="fa fa-upload"></i>
                </button>
                {src && src !== '' && 
                <button className="btn-icon action action-remove" onClick={()=>{
                    reset()
                }}>
                    <i className="fa fa-trash"></i>
                </button>
                }
            </div>
            {src && src !== '' && 
                <img src={src} ref={imageRef} />
            }
            <input type='file' onChange={onFileChange} value={''} style={{display:'none'}} ref={inputRef} />
        </div>
    )
}