export const device_types = [
    {
        _id: 1,
        name: 'VR Headset',
    },
    {
        _id: 2,
        name: 'Tablet',
    },
    {
        _id: 3,
        name: 'Mobile Phone',
    },
    {
        _id: 4,
        name: 'Laptop',
    }
]

export const devices = [
    {
        _id: 1,
        name: 'VR Headset 22',
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        sn: '0000000012456789', //Serial Number
        approved_by: {
            _id: 1,
            name: 'Dylan Lorenz',
        },
        type: 1, //VR Headset, Mobile, Laptop, Tablet
        city: 'Conroe', // Primary Location City
        detail: 'The Device is used to conduct AmeriTex related previews in VR of custom tailored content for to be used for educating our culture.',
        created_at: '2021-03-01 00:00:45'
    },
    {
        _id: 2,
        name: 'VR Headset 26',
        image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        sn: '0000000012456789',
        approved_by: {
            _id: 1,
            name: 'Dylan Lorenz',
        },
        type: 1,
        city: 'Conroe',
        detail: 'The Device is used to conduct AmeriTex related previews in VR of custom tailored content for to be used for educating our culture.',
        created_at: '2023-03-01 02:00:12'
    },
    {
        _id: 3,
        name: 'VR Headset 29',
        image: 'https://images.unsplash.com/photo-1622979135240-caa6648190b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        sn: '0000000012456789',
        approved_by: {
            _id: 1,
            name: 'Dylan Lorenz',
        },
        type: 1,
        city: 'Conroe',
        detail: 'The Device is used to conduct AmeriTex related previews in VR of custom tailored content for to be used for educating our culture.',
        created_at: '2022-05-01 05:00:23'
    }
]
