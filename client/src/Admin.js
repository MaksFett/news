import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Header from './components/Header'
import ReactLoading from 'react-loading'
import { Tabs, Tab } from 'react-bootstrap'
import { DataGrid } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useParams, useNavigate } from 'react-router-dom'

export default function Admin() {
    const [login, setlogin] = useState('')
    const [role, setrole] = useState('')
    const [authorized, setAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [articles, setArticles] = useState([])
    const [categories, setCategories] = useState([])
    const [comments, setComments] = useState([])
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        var MyParams = {headers: {
        Authorization: 'Bearer ' + localStorage.getItem("jwt_token")
        }}
        axios.get('/api/main/readlogin', MyParams)
        .then((response) => {
            setlogin(response.data['login'])
            setrole(response.data['role'])
            setAuth(true)
        }).catch((error) => {
            if ((error.response.status === 401) || (error.response.status === 422)){
                setAuth(false)
                setLoading(false)
            }
            console.log(error)
        })
        axios.get('/api/admin/get_all', MyParams)
        .then((response) => {
            if (response.data !== 0) {
                setUsers(response.data['users'])
                setArticles(response.data['articles'])
                setCategories(response.data['categories'])
                setComments(response.data['comments'])
                setLoading(false)
            }
        }).catch((error) => {
            console.log(error)
        })

        
    }, [params])

    useEffect(() => {
        if ((!authorized && role !== '') || role === 'user') {
            navigate('/', {replace: true})
        }
    }, [authorized, role, navigate])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        setAuth(false)
        setlogin('')
    }

    const user_cols = [
        {field: 'id', headerName: 'ID', flex: 0.5},
        {field: 'login', headerName: 'Логин', flex: 1, editable: true},
        {field: 'is_admin', headerName: 'Является ли админом', flex: 0.5},
        {field: 'name', headerName: 'Имя автора', flex: 1, editable: true},
        {field: 'count', headerName: 'Количество статей', flex: 0.5},
        {field: 'actions', type: 'actions', headerName: 'Действия', flex: 0.3, getActions: () => [<EditIcon />, <DeleteIcon />]}
    ]

    const art_cols = [
        {field: 'id', headerName: 'ID', flex: 0.5},
        {field: 'author', headerName: 'Автор', flex: 0.5, editable: true},
        {field: 'date', headerName: 'Дата публикации', flex: 0.5, editable: true},
        {field: 'title', headerName: 'Название', flex: 0.5, editable: true},
        {field: 'text', headerName: 'Текст', flex: 1, editable: true},
        {field: 'comm_count', headerName: 'Количество комментариев', flex: 0.7},
        {field: 'view_count', headerName: 'Количество просмотров', flex: 0.7},
        {field: 'like_count', headerName: 'Количество лайков', flex: 0.7},
        {field: 'actions', type: 'actions', headerName: 'Действия', flex: 0.5, getActions: () => [<EditIcon />, <DeleteIcon />]}
    ]

    const cat_cols = [
        {field: 'id', headerName: 'ID', flex: 0.5},
        {field: 'name', headerName: 'Название', flex: 1, editable: true},
        {field: 'count', headerName: 'Количество статей', flex: 0.5},
        {field: 'actions', type: 'actions', headerName: 'Действия', flex: 0.3, getActions: () => [<EditIcon />, <DeleteIcon />]}
    ]

    const comm_cols = [
        {field: 'id', headerName: 'ID', flex: 0.5},
        {field: 'user', headerName: 'Пользователь', flex: 0.5, editable: true},
        {field: 'article', headerName: 'Статья', flex: 0.5, editable: true},
        {field: 'text', headerName: 'Текст', flex: 2, editable: true},
        {field: 'parent', headerName: 'Родительский комментарий', flex: 0.5, editable: true},
        {field: 'actions', type: 'actions', headerName: 'Действия', flex: 0.3, getActions: () => [<EditIcon />, <DeleteIcon />]}
    ]

    return (
      <>
        <div className='bg-success'>
            <Header authorized={authorized} login={login} role={role} exit={exit} page={'/'}/>
        {loading ?
            <div className="App-loading">
                <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div className='mx-5 my-3 p-5 bg-body-tertiary'>
                <Tabs
                    defaultActiveKey="users"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                >
                    <Tab eventKey="articles" title="Статьи">
                        <DataGrid columns={art_cols} rows={articles} />
                    </Tab>
                    <Tab eventKey="users" title="Пользователи">
                        <DataGrid columns={user_cols} rows={users} />
                    </Tab>
                    <Tab eventKey="categories" title="Категории">
                        <DataGrid columns={cat_cols} rows={categories} />
                    </Tab>
                    <Tab eventKey="comments" title="Комментарии">
                        <DataGrid columns={comm_cols} rows={comments} /> 
                    </Tab>
                </Tabs>
                {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
            </div>
        }
        </div>
      </>
    );
  }