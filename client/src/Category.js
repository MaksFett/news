import axios from 'axios'
import React, {useState, useEffect} from 'react'
import ListedArticle from './components/ListedArticle'
import Header from './components/Header'
import { Container, Row, Col, Button } from 'react-bootstrap'
import ReactLoading from 'react-loading'
import { useParams, useNavigate } from 'react-router-dom'

export default function Category() {
    const [login, setlogin] = useState('')
    const [role, setrole] = useState('')
    const [authorized, setAuth] = useState(false)
    const [articles, setArticles] = useState({})
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState({})
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
        MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_category', MyParams)
        .then((response) => {
            setCategory(response.data)
            console.log(response.data)
        }).catch((error) => {
            if ((error.response.status === 401) || (error.response.status === 422)){
                setAuth(false)
            }
            console.log(error)
        })
        axios.post('/api/main/get_articles_by_category', MyParams)
        .then((response) => {
            setArticles(response.data)
        }).catch((error) => {
            console.log(error)
        })
    }, [params])

    useEffect(() => {
        if (articles.length !== 0 && Object.keys(category).length !== 0) {
          setLoading(false)
        }
        if (category) {
            document.title = 'Категория ' + category[0]
        }
    }, [articles, category])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        setAuth(false)
        setlogin('')
    }

    const delete_category = () => {
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/delete_category', MyParams)
            .then((response) => {
                console.log(response)
                navigate('/', {replace: true})
            }).catch((error) => {
                console.log(error)
            })
    }

    return (
      <>
        <div className='bg-success'>
            <Header authorized={authorized} login={login} role={role} exit={exit} page={'/'}/>
        {loading ?
            <div className="App-loading">
                <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div>
                <div className='mx-lg-5 my-3 p-5 bg-body-tertiary'>
                    <div>
                        <h2 className='m-3'>Категория {category[0]}</h2>
                        <h4 className='m-3'>Количество статей: {category[1]}</h4>
                    </div>
                    {role === 'admin' && <Button onClick={delete_category} variant='danger'>Удалить категорию</Button>}
                    <div>
                        <Container fluid className='mt-5 px-5'>
                            {articles.length > 0 && articles.map(article => (
                                <Row><Col key={article[0]}><ListedArticle article={article} /></Col></Row>
                            ))}
                        </Container>
                    </div>
                </div>
                {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
            </div>
        }
        </div>
      </>
    );
  }