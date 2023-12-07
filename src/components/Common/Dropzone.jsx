// import React from "react";
import { useDropzone } from "react-dropzone";

const CustomDropzone = (props) => {
    const { types } = props
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: (types && types.length) ? types.join(', ') : 'image/png, video/mp4',
        onDrop: (acceptedFiles) => {
            console.log(acceptedFiles);
            props.onDrop(acceptedFiles);
        }
    });

    return (
        <section className="container">
            {
                <div className="dropzone">
                    <div
                        className="dz-message needsclick"
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} name={props.name} />
                        {/* <div className="mb-3">
                    <i className="mdi mdi-cloud-upload display-4 text-muted"></i>
                    </div> */}
                        <span>Drop files here or click to upload.</span>
                    </div>
                </div>}
        </section>
    )
}

export default CustomDropzone;
