import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import axios from 'axios'
import {Button} from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Select from 'react-select'

function Header(props){
    const [searchItem, setsearchitem] = useState({})
    const [options, setoptions] = useState([])
    const navigate = useNavigate() 

    useEffect(() => {
        axios.post('/api/main/get_search_options')
        .then((response) => {
            let data = []
            data.push(response.data[0].map((option) => ({value: 'ca' + option[0], label: 'Категория: ' + option[1]})))
            data.push(response.data[1].map((option) => ({value: 'pu' + option[0], label: 'Издательство: ' + option[1]})))
            data.push(response.data[2].map((option) => ({value: 'au' + option[0], label: 'Автор: ' + option[1]})))
            data.push(response.data[3].map((option) => ({value: 'ar' + option[0], label: 'Статья: ' + option[1]})))
            setoptions(data.flat())
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    const searchUpdate = (term) => {
        setsearchitem(term)
    }

    const findItem = () => {
        console.log(searchItem)
        if (Object.keys(searchItem).length !== 0){
            switch (searchItem.value.slice(0, 2)){
                case 'ca':
                    navigate('/category/' + searchItem.value.slice(2))
                    break
                case 'pu':
                    navigate('/publisher/' + searchItem.value.slice(2))
                    break
                case 'au':
                    navigate('/profile/' + searchItem.value.slice(2))
                    break
                case 'ar':
                    navigate('/article/' + searchItem.value.slice(2))
                    break
                default:
                    break
            }
        }
    }

    return(
        <Navbar expand="lg" className="p-2 bg-dark">
            <Col>
                <Navbar.Brand href="/" className='text-light mx-1'>Главная</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
            </Col>
            <Col xs={9} className='d-flex justify-content-center'>
                <Select className='w-50' styles={{'zIndex': 1000}} options={options} placeholder='Поиск' value={searchItem} onChange={searchUpdate} isSearchable={true} />
                <Button onClick={findItem} className='mx-2'>Поиск</Button>
            </Col>
            <Col>
                <div className='text-center text-light m-1'>
                    {props.authorized ?
                        <NavDropdown title={props.login} drop='down-centered'>
                            <NavDropdown.Item>
                                <Link to={'/profile/' + props.login} style={{ textDecoration: 'none', color: 'black'}}>
                                    Мой профиль
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={props.exit}>Выход</NavDropdown.Item>
                        </NavDropdown>
                        :
                        <Link to="/authorization" state={{'curr_page': props.page}}>
                            <Button>Войти/Регистрация</Button>
                        </Link>
                    }
                </div>
            </Col>
        </Navbar>
    )
}

export default Header;