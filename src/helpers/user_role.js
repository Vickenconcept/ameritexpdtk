import { cities, factories } from "./globals"

export const getActiveCities = (user) => {
    if (user.role == 'Admin') return cities
    else if (user.location) return [user.location]
    else return []
}

export const canGetAllCities = (user) => {
    return user.role == 'Admin'
}

export const getActiveFactories = (user) => {
    if (user.role == 'Admin') return factories
    else if (user.factory) return [user.factory == "Pipe" || user.factory == "Box" ? "Pipe And Box" : user.factory]
    else return []
}

export const canGetAllFactories = (user) => {
    return user.role == 'Admin'
}

export const canChangePart = (user) => {
    return user.role == 'Admin'
}

export const canChangeJob = (user) => {
    return user.role == 'Admin' || user.role == 'Production'
}
