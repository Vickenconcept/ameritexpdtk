import {getMediaType, getMediaPreview, getMediaUrl} from "./MediaUtils"
import MediaList from "./MediaList"
import { useState } from "react"
import axios from "axios"

const MediaPreview = ({ preview, media, id, city, type, updateItem, reload, toggle }) => {

    const [pre, setPre] = useState(preview)

    const onDelete = async (idx) => {
        console.log("delete");
        console.log(idx);
        const res = await axios.delete ('/timer/edit-product-preview', {
            data: { id, idx, city, type },
        })
        updateItem ("media",res.data.item?.media)
    }

    const onSelect = async (idx) => {
        console.log("select");
        console.log(idx);
        
        setPre (media[idx]?.url)
        if (media[idx].mimeType.startsWith("image")) {
            // const res = await axios.post ('/timer/edit-product-preview', {
            //     id, idx, city, type,
            // })
            // updateItem ("preview",res.data.item?.preview)
            updateItem ("preview",media[idx]?.url)
        }
    }

    return (
        <>
        <div 
            className="product-preview product-preview-full" 
        >
            {getMediaType(pre)=="video" ? (
                <>
                    <iframe width="100%" height="100%"
                        src={getMediaUrl(pre)+"?autoplay=0"}
                    >
                    </iframe>
                </>
            ) : getMediaType(pre)=="image" ? (
            <img src={getMediaUrl(pre)} className="w-100 h-100" />
            ) : ("")}
        </div>
        <div className="flex-1" style={{width:'100%', marginTop: '15px'}}>
                <MediaList items={media} onDelete={onDelete} onSelect={onSelect} />
            </div>
        </>
    )
}

export default MediaPreview;
