const initialState = {
    heroes: [],
    heroesLoadingStatus: 'idle'
}

const heroes = (state = initialState, action) => {
    switch (action.type) {
        case 'HEROES_FETCHING':
            return {
                ...state,
                heroesLoadingStatus: 'loading',
            }
        case 'HEROES_FETCHED':
            return {
                ...state,
                heroes: action.payload,
                heroesLoadingStatus: 'idle'
            }
        case 'HEROES_FETCHING_ERROR':
            return {
                ...state,
                heroesLoadingStatus: 'error'
            }
        case 'HERO_CREATED':
            return {
                ...state,
                // Формируем новый массив - разворачивая сперва старых героев и добавляем нового
                heroes: [...state.heroes, action.payload]
            }
        case 'HERO_DELETED': 
            return {
                ...state,
                // Формируем новый массив из нового списка героев. filter возвращает новый массив и
                // новый список помещается в heroes
                heroes: state.heroes.filter(item => item.id !== action.payload)
            }
        default: return state
    }
}

export default heroes;