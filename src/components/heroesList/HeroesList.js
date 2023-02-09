import {useHttp} from '../../hooks/http.hook';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup} from 'react-transition-group';
import { createSelector } from 'reselect';

import { heroesFetching, heroesFetched, heroesFetchingError, heroDeleted } from '../../actions';
import HeroesListItem from "../heroesListItem/HeroesListItem";
import Spinner from '../spinner/Spinner';

import './heroesList.scss';

const HeroesList = () => {

    const filteredHeroesSelector = createSelector(
        // Первая функция из глобального state, получаем поле activeFilter
        (state) => state.filters.activeFilter,
        // Вторая функция из глобального state, получаем поле heroes
        (state) => state.heroes.heroes,
        //конечная функция. Где первый аргумент, это то, что пришло из результата первой функции
        // Второй аргумент, то что пришло из результата второй функции
        (filter, heroes) => {
            if (filter === 'all') {
                return heroes;
            } else {
            // из state вытаскиваем список героев, фильтруем, если у героя фильтр совпадает с активным фильтром
            // то в таком случае, он попадает в новый массив, который уйдет в filteredHeroes
                return heroes.filter(item => item.element === filter)
            }
        }
    );
    // Получаем список отфильтрованных героев и присваиваем переменной filteredHeroes
    const filteredHeroes = useSelector(filteredHeroesSelector);
    // деструктуируем из state два поля heroes и heroesLoadingStatus
    const heroesLoadingStatus = useSelector(state => state.heroesLoadingStatus);
    const dispatch = useDispatch();
    // получаем объект запроса
    const {request} = useHttp();

    useEffect(() => {
        dispatch(heroesFetching());
        request("http://localhost:3001/heroes")
        //Передача данных data полученных от сервера, которые передаются в actionCreaters heroesFetched  
            .then(data => dispatch(heroesFetched(data)))
            .catch(() => dispatch(heroesFetchingError()))

        // eslint-disable-next-line
    }, []);

    // Функция берет id и по нему удаляет ненужного персонажа из store
    // ТОЛЬКО если запрос на удаление прошел успешно
    // Отслеживайте цепочку действий actions => reducers
    // Функция onDelete используется в обработчике событий, оборачиваем в useCallback, потому что
    // функция передается дочернему компоненту. И чтобы каждый раз не перерендеривался дочерний
    // компонент
    const onDelete = useCallback((id) => {
        // Удаление персонажа по его id, который приходит в функцию onDelete аргументом
        // метод "DELETE", чтобы удалить персонажа
        request(`http://localhost:3001/heroes/${id}`, "DELETE")
        // data это тот персонаж, который был удален
            .then(data => console.log(data, 'Deleted'))
            .then(dispatch(heroDeleted(id)))
            .catch(err => console.log(err));
        // eslint-disable-next-line  
    }, [request]);

    if (heroesLoadingStatus === "loading") {
        return <Spinner/>;
    } else if (heroesLoadingStatus === "error") {
        return <h5 className="text-center mt-5">Ошибка загрузки</h5>
    }
    //Функция для создания списка героев
    const renderHeroesList = (arr) => {
        if (arr.length === 0) {
            return (
                <CSSTransition
                    timeout={0}
                    classNames="hero">
                    <h5 className="text-center mt-5">Героев пока нет</h5>
                </CSSTransition>
            )
        }

        return arr.map(({id, ...props}) => {
            return (
                <CSSTransition 
                    key={id}
                    timeout={500}
                    classNames="hero">
                        {/* onDelete(id) id который получаем от сервера */}
                    <HeroesListItem  {...props} onDelete={() => onDelete(id)}/>
                </CSSTransition>
            )
        })
    }

    const elements = renderHeroesList(filteredHeroes);
    return (
        <TransitionGroup component="ul">
            {elements}
        </TransitionGroup>
    )
}

export default HeroesList;