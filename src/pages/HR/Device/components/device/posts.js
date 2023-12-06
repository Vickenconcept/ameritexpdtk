export default ({comments = [], show, setShow}) => {
    const onToggle = () => {
        setShow(!show);
    }
    return (
        <>
        <div className='divider-line-arrow'>
            <div className={`arrow-${show?'up':'down'} post-list-arrow`} onClick={onToggle}>
                
            </div>
            <span>
                Comments
            </span>
        </div>
        <div className={`post-list-container ${show?'show':'hide'}`}>
            <div className="post-comment-title">Your Reply</div>
            <div className='post-comment'>
                <div className='avatar'>
                    <img src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50' alt='avatar' />
                </div>
                <div className="action-container">
                    <button className='btn btn-normal'>
                        Post Comment
                    </button>
                </div>
                <textarea className='form-control' placeholder='Type here to comment on this device'></textarea>
            </div>
            {comments?.length > 0 && (
                <>
                <div className="post-list">
                    <h2>{comments.length} Comments</h2>
                    <div className="post-list-item">
                        <div className="avatar">
                            <img src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50' alt='avatar' />
                        </div>
                        <div className="post-content">
                            <div className="name">Rocky Lorenz</div>
                            <div className="text">
                                Can I use your headset next weekend?
                            </div>
                            <div className="device">
                                on
                                <span className="device-name">Device Name</span>
                            </div>
                            <div className="time">2 hours ago</div>
                            <div className="post-list-item post-reply">
                                <div className="avatar">
                                    <img src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50' alt='avatar' />
                                </div>
                                <div className="post-content">
                                    <div className="name">
                                        Rocky Lorenz
                                        <span className="time">1.5 hours ago</span>
                                    </div>
                                    <div className="text">
                                        Hi Joseph,
                                        <br />
                                        <br />
                                        Thank you for purchasing our course!. 
                                        <br />
                                        Please have a look at the course content and let us know if you have any questions.
                                    </div>
                                    <div className="actions">
                                        <button className="btn btn-icon btn-sm action">
                                            <i className="fa fa-heart"></i>
                                            3
                                        </button>
                                        <button className="btn btn-icon btn-sm action">
                                            <i className="fa fa-thumbs-up"></i>
                                            20
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div class="divider-line-arrow"></div> */}
                </>
            )}
            <div className='post-list-divider'>
                <div className='bar-1'></div>
            </div>
        </div>
        </>
    )
}