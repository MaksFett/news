import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useLocation, useNavigate, useParams} from 'react-router-dom'
import Header from './components/Header'
import AuthorModal from './components/AuthorModal'
import ArticleModal from './components/ArticleModal'
import ReactLoading from 'react-loading'
import { Container, Row, Col, Button } from 'react-bootstrap'
import * as Yup from 'yup'
import ListedArticle from './components/ListedArticle'

function Profile(){
    const [user, setuser] = useState({})
    const [login, setlogin] = useState('')
    const [role, setrole] = useState('')
    const [authorized, setAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState([])
    const [auth_modal, setauthmodal] = useState(false)
    const [add_modal, setaddmodal] = useState(false)
    const [error, seterror] = useState('')
    const [formValues, setformValues] = useState({'title': '', 'text': '<p></p>', 'category': '', 'categories': []})
    const navigate = useNavigate()
    const params = useParams()
    const location = useLocation()

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
                console.log(error)
            })
        var myParams = {data : params.login}
        axios.post('/api/autho/getuser', myParams)
            .then((response) => {
                setuser(response.data)
            }).catch((error) => {
                console.log(error)
            })
        axios.post('/api/main/get_author_articles', myParams)
            .then((response) => {
                setArticles(response.data)
            }).catch((error) => {
                console.log(error)
            })
    }, [params])

    useEffect(() => {
        if (location.state && 'author_name' in user) {
            setaddmodal(true)
        }
        if (user) {
            document.title = 'Личный кабинет ' + user['login']
        }
    }, [user, location])
    
    useEffect(() => {
        if (articles.length !== 0 || !('author_name' in user)){
            setLoading(false)
        }
    }, [articles, user])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        navigate('/', {replace: true})
    }

    const delete_user = () => {
        var MyParams = {data: {'id': user['id']}}
        axios.post('/api/main/delete_user', MyParams)
            .then((response) => {
                console.log(response)
                navigate('/', {replace: true})
            }).catch((error) => {
                console.log(error)
            })
    }

    const AuthorSchema = Yup.object().shape({
        name: Yup.string()
        .min(3, 'Слишком короткое имя')
        .max(30, 'Слишком длинное имя')
        .required('Обязательное поле'),
        publisher: Yup.string()
        .min(3, 'Слишком короткое название издательства')
        .max(40, 'Слишком длинное название издательства'),
      });

    const ArticleSchema = Yup.object().shape({
        title: Yup.string()
        .min(3, 'Слишком короткое название')
        .max(150, 'Слишком длинное название')
        .required('Обязательное поле'),
        category: Yup.string()
        .min(3, 'Слишком короткое название категории')
        .max(30, 'Слишком длинное название категории'),
        text: Yup.string()
        .min(20, 'Слишком маленький текст')
        .required('Обязательное поле'),
      });

  
    return(
        <>
            <div className='bg-success'>
                <Header authorized={authorized} login={login} role={role} exit={exit} page={'/profile/' + params.login}/>
            {loading ?
                <div className="App-loading">
                    <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
                </div>
            :
                <div>
                    <div className='m-5 p-5 bg-body-tertiary'>
                        <Container>
                            <Row>
                                <Col xs={8} className='d-flex justify-content-center'>
                                    <Container>
                                        {'author_name' in user ? (
                                            <>
                                                <Row>
                                                    <Col><h1>{user['author_name']}</h1></Col>
                                                </Row>
                                                <Row>
                                                    <Col><h4>{user['login']}</h4></Col>
                                                </Row>
                                            </>
                                        ) : (
                                            <Row>
                                                <Col><h1>{user['login']}</h1></Col>
                                            </Row>
                                        )}
                                        {user['login']===login && (
                                            <div>
                                                {'author_name' in user ? (
                                                    <Row className='mt-3'>
                                                        <Col><Button onClick={() => setaddmodal(true)}>Написать статью</Button></Col>
                                                    </Row>
                                                ) : (
                                                    <Row className='mt-3'>
                                                        <Col><Button onClick={() => setauthmodal(true)}>Стать автором</Button></Col>
                                                    </Row>
                                                )}
                                                <Row className='mt-3'>
                                                    <Col><Button onClick={exit} variant='danger'>Выход</Button></Col>
                                                </Row>
                                            </div>
                                            )
                                        }
                                        {role === 'admin' & user['login'] !== login ?
                                            <Button onClick={delete_user} variant='danger'>Удалить пользователя</Button> : <></>} 
                                        {'article_count' in user &&(
                                            <Row className='mt-4 ms-2'><Col><h5>Количество статей: {user['article_count']}</h5></Col></Row>
                                        )}
                                    </Container>
                                </Col>
                            </Row>
                        </Container>
                        {'author_name' in user ? (
                            <Container fluid className='mt-2'>
                                {articles.map(article => (
                                    <Row><Col key={article[0]}><ListedArticle article={article} /></Col></Row>
                                ))}
                            </Container>
                        ) : (<></>)} 
                    </div>
                    {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
                    <AuthorModal 
                        auth_modal={auth_modal} 
                        setauthmodal={setauthmodal} 
                        seterror={seterror} 
                        AuthorSchema={AuthorSchema} 
                        user={user}
                        setuser={setuser} />
                    <ArticleModal 
                        add_modal={add_modal} 
                        setaddmodal={setaddmodal} 
                        formValues={formValues}
                        setformValues={setformValues} 
                        error={error} 
                        seterror={seterror} 
                        ArticleSchema={ArticleSchema} 
                        user={user} />
                </div>
            }
            </div>
        </>
    )
}

export default Profile