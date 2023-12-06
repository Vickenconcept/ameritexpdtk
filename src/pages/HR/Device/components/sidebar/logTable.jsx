import { useState, useMemo, useEffect } from "react"
import { useDevice } from "../../context/device"
import { useSidebar } from "../../context/sidebar"
import moment from "moment"

import './table.scss'

export const Table = () => {
    const {
        consts,
        deviceAction,
    } = useDevice ()
    const {
        tab
    } = useSidebar ()
    const [logs, setLogs] = useState ([])
    const [loading, setLoading] = useState (false)
    const [page, setPage] = useState (0)
    const [pageOption, setPageOption] = useState (30)
    const [search, setSearch] = useState ('')

    const getLogs = async () => {
        let res = await deviceAction.getLogs()
        setLogs(res?.data || [])
    }

    const filteredLogs = useMemo(() => {
        let res = logs.filter(log => {
            return log?.note?.toLowerCase().includes(search.toLowerCase())
        })
        return res?.slice(page * pageOption, (page + 1) * pageOption)
    },[logs, page, pageOption, search])

    const totalPages = useMemo(() => {
        const tmp = Math.ceil(logs.length / pageOption)
        if (page > tmp) setPage(tmp)
        return tmp
    },[logs, pageOption])

    const onPagePrev = () => {
        if (page > 0) {
            setPage(page - 1)
        }
    }

    const onPageNext = () => {
        if (page < totalPages - 1) {
            setPage(page + 1)
        }
    }

    const openEdit = () => {
        openEditModal(device)
    }

    useEffect(() => {
        if (tab?.name === 'SYSTEM LOG') {
            setLoading(true)
            getLogs()
            setLoading(false)
        }
    },[tab])

    return (
        <div className="log-table-wrapper">
            <div className='log-list-table full'>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th width="*">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs?.map((log, index) => (
                            <tr key={index}>
                                <td>{log?.createdAt ? moment(log?.createdAt)?.format('MM/DD/YY') : ''}</td>
                                <td>{log?.createdAt ? moment(log?.createdAt)?.format('HH:mm:ss') : ''}</td>
                                <td>{log?.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <div className="pagination-item" onClick={onPagePrev}>
                    <i className="mdi mdi-chevron-left"></i>
                </div>
                {totalPages > 0 && 
                <div className="pagination-info">
                    <div className="pagination-item active">
                        {page + 1}
                    </div>
                    of
                    <div className="pagination-item">
                        {totalPages}
                    </div>
                </div>
                }
                <div className="pagination-item" onClick={onPageNext}>
                    <i className="mdi mdi-chevron-right"></i>
                </div>
            </div>
        </div>
    )

}

export default Table
