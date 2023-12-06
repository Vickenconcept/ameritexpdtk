import React from 'react'

export default ({ group, src, thumb, subHtml, children }) => {
    return (
        <div
            data-sub-html={subHtml}
            data-src={src}
            className="react_lightgallery_item"
            data-lg-size="480-480-480, 800-800-800, 1400-1400"
            data-pinterest-text="Shinimamiya, Osaka, Japan"
            data-tweet-text="Shinimamiya, Osaka, Japan"
            data-facebook-share-text="Shinimamiya, Osaka, Japan"
            data-googleplus-share-text="Shinimamiya, Osaka, Japan"
            data-twitter-share-text="Shinimamiya, Osaka, Japan"
            data-linkedin-share-text="Shinimamiya, Osaka, Japan"
            data-download-url="https://sachinchoolur.github.io/lightgallery.js/static/img/1-1600.jpg"
            // data-download="true"
            // data-autoplay="false"
            // data-rotate="false"
            // data-zoom="true"
            // data-fullscreen="true"
            data-responsive={src}
        >
            {/* {children} */}
            <img src={src} />
        </div>
    )
}