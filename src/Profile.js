import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams} from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Header from './components/Header'
import ReactLoading from 'react-loading'
import { Button, CloseButton } from 'react-bootstrap'
import ReactModal from 'react-modal'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import ListedArticle from './components/ListedArticle'

function Profile(){
    const [user, setuser] = useState({})
    const [login, setlogin] = useState({})
    const [authorized, setAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState([])
    const [auth_modal, setauthmodal] = useState(false)
    const [add_modal, setaddmodal] = useState(false)
    const [error, seterror] = useState('')
    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        var MyParams = {headers: {
            Authorization: 'Bearer ' + localStorage.getItem("jwt_token")
        }}
        axios.get('/api/main/readlogin', MyParams)
            .then((response) => {
                setlogin(response.data)
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
                console.log(articles)
            }).catch((error) => {
                console.log(error)
            })
    }, [params])

    useEffect(() => {
        if (articles.length !== 0 || !('author_name' in user)){
            setLoading(false)
        }
    }, [articles])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        navigate('/', {replace: true})
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
  
    const registrate_author = (author) => {
        setLoading(true)
        var myParams = {data : {'user_id' : user['id'], ...author}}
        axios.post('/api/reg/add_author', myParams)
        .then((response) => {
                if (response.data == '0') {
                    seterror('Автор с таким именем уже существует')
                }
                else {
                    setauthmodal(false)
                    setuser({...user, ...response.data})
                    if (error !== ''){
                        seterror('')
                    }
                }
                console.log(response)
            }
        ).catch((error) => {
            console.log(error)
        })
        setTimeout(() => setLoading(false), 500)
    }

    const add_article = (article) => {
        setLoading(true)
        var myParams = {data : {...article, "author_id": user['id']}}
        axios.post('/api/main/add_article', myParams)
        .then((response) => {
                if (response.data == '1'){
                    setaddmodal(false)
                    if (error !== ''){
                        seterror('')
                    }
                }
                else {
                    seterror('Хотя бы одна категория должна быть указана')
                } 
                console.log(response)
            }
        ).catch((error) => {
            console.log(error)
        })
        setTimeout(() => setLoading(false), 500)
    }
  
    return(
        <>
        {loading ?
            <div className="App-loading">
            <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div className='bg-success'>
                <Header authorized={authorized} login={login} exit={exit} page={'/profile/' + params.login}/>
                <div className='m-5 p-5 bg-body-tertiary'>
                    <Container>
                        <Row>
                            <Col xs={8} className='d-flex justify-content-center'>
                                <Container>
                                    <Row>
                                        <Col><h1>{user['login']}</h1></Col>
                                    </Row>
                                    {'author_name' in user && (
                                        <Row>
                                            <Col xs lg="4"><h4>{user['author_name']}</h4></Col>
                                            {'publisher_name' in user && (
                                                <Col><Link to={'/publisher/' + user['publisher_id']} style={{ textDecoration: 'none', color: 'black'}}><h4>Издательство {user['publisher_name']}</h4></Link></Col>
                                            )}
                                        </Row>
                                    )}
                                    {user['login']==login && (
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
                <ReactModal isOpen={auth_modal} >
                    <CloseButton onClick={() => { seterror(''); setauthmodal(false)} } />
                    <Container>
                        <Row>
                            <Col>
                                <Formik initialValues={{ "name" : '', "publisher" : ''}} validationSchema={AuthorSchema} onSubmit={(values) => {registrate_author(values)}} >
                                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                                    <div>
                                        <div className="row mb-1">
                                            <div className="col-lg-12">
                                                <h1 className="mt-1">Регистрация за автора</h1>
                                            </div>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label htmlFor="name">Имя</label>
                                                <div></div>
                                                <Field className="col-4" 
                                                    name='name' 
                                                    type='text' 
                                                    placeholder='Введите имя' 
                                                    value={values.name} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                {errors.name && touched.name ? (
                                                    <div style = {{color: 'red'}}>{errors.name}</div>
                                                ) : (<div>&nbsp;</div>)}
                                                <label htmlFor="publisher">Издательство (опционально)</label>
                                                <div></div>
                                                <Field className="col-4"
                                                    name='publisher'
                                                    type='text'
                                                    placeholder='Введите название издательства'
                                                    value={values.publisher}
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                {errors.publisher && touched.publisher ? (
                                                    <div style = {{color: 'red'}}>{errors.publisher}</div>
                                                ) : (<div>&nbsp;</div>)}
                                            </div>
                                            <Button type="submit">Стать автором</Button>
                                        </Form>
                                    </div>
                                )}
                                </Formik>
                            </Col>
                        </Row>
                    </Container>
                </ReactModal>
                <ReactModal isOpen={add_modal} >
                    <CloseButton onClick={() => { seterror(''); setaddmodal(false)} } />
                    <Container>
                        <Row>
                            <Col>
                                <Formik initialValues={{ "title" : '', "text": '', "category" : '', "categories": []}} validationSchema={ArticleSchema} onSubmit={(values) => {add_article(values)}} >
                                {({ handleSubmit, handleChange, handleBlur, setFieldValue, values, touched, errors, }) => (
                                    <div>
                                        <div className="row mb-1">
                                            <div className="col-lg-12">
                                                <h1 className="mt-1">Создание статьи</h1>
                                            </div>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label htmlFor="title">Название статьи</label>
                                                <div></div>
                                                <Field className="col-4" 
                                                    name='title' 
                                                    type='text' 
                                                    placeholder='Введите название статьи' 
                                                    value={values.title} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                {errors.title && touched.title ? (
                                                    <div style = {{color: 'red'}}>{errors.title}</div>
                                                ) : (<div>&nbsp;</div>)}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="categories">Категории</label>
                                                <div></div>
                                                <Field className='mb-2 col-4' 
                                                    name='category' 
                                                    type='text' 
                                                    placeholder='Введите категорию' 
                                                    value={values.category} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                <div></div>
                                                <Button onClick={() => {
                                                    if (values.category !== '') {
                                                        setFieldValue("categories", [...new Set([...values.categories, values.category])]) 
                                                        setFieldValue("category", '')
                                                    }
                                                    }}>Добавить</Button>
                                                {values.categories.map((category) => 
                                                    <Button variant="dark" className='mx-2' 
                                                        onClick={() => {setFieldValue("categories", values.categories.filter((value) => value !== category))}}>
                                                            {category}
                                                    </Button>)}
                                                {errors.category && touched.category ? (
                                                    <div style = {{color: 'red'}}>{errors.category}</div>
                                                ) : (<div>&nbsp;</div>)}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="text">Текст статьи</label>
                                                <div></div>
                                                <Field className="col-10" 
                                                    as='textarea'
                                                    rows='8'
                                                    name='text' 
                                                    type='text' 
                                                    placeholder='Введите текст статьи' 
                                                    value={values.text} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                {errors.text && touched.text ? (
                                                    <div style = {{color: 'red'}}>{errors.text}</div>
                                                ) : (<div>&nbsp;</div>)}
                                            </div>
                                            <div style = {{color: 'red'}}>{error}&nbsp;</div>
                                            <Button type="submit">Создать статью</Button>
                                        </Form>
                                    </div>
                                )}
                                </Formik>
                            </Col>
                        </Row>
                    </Container>
                </ReactModal>
            </div>
        }
        </>
    )
}

export default Profile