import { useCallback } from "react";
import {getMediaType, getMediaPreview, getMediaUrl} from "./MediaUtils"

const MediaList = (props) => {
    const {items} = props;

    const getType = useCallback((mime) => {
        let mimeArr = mime.split("/");
        if (mimeArr.length > 1){
            return mimeArr[1].toUpperCase();
        } else {
            return mime.toUpperCase();
        }
    })

    const onSelect = (e, idx) => {
        e.preventDefault();
        props.onSelect(idx);
    }

    const onDelete = (e, idx) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this media?")){
            props.onDelete(idx);
        }
    }

    return (
        <div className="file-list mb-3">
            <table className="">
                <thead>
                    <tr className="heading">
                        <th width={'60%'}>
                            File Name
                        </th>
                        <th width={'20%'}>
                            File Type
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {items && items.map((media, idx)=>
                    <tr key={idx}>
                        <td className="singlelinedotted" >
                            <a 
                             onClick={(e)=>onSelect(e, idx)}
                                // href={media.url} 
                                target="_blank"
                            >
                                {media.name}
                            </a>
                        </td>
                        <td>
                            {getType (media.mimeType)}
                            {/* <i className={"fa fa-"+media.mimeType+""}></i> */}
                        </td>
                        <td>
                            <a onClick={(e)=>onDelete(e, idx)}>DELETE</a>
                        </td>
                    </tr>
                )}
                
                {!items?.length ? (<tr className="no-media"><td>No Media Previews</td></tr>):""}
                </tbody>
            </table>
        </div>
    )
}

export default MediaList;
