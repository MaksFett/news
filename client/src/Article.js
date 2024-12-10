import React, {useState, useEffect, useCallback} from 'react'
import {useParams, Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Container, Row, Col, Button, Badge } from 'react-bootstrap'
import Header from './components/Header'
import Comment from './components/Comment'
import ReactLoading from 'react-loading'
import IconButton from '@mui/material/IconButton'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import AddBox from '@mui/icons-material/AddBox'

function Article(){
    const params = useParams()
    const [login, setlogin] = useState('')
    const [role, setrole] = useState('')
    const [article, setArticle] = useState()
    const [categories, setCategories] = useState([])
    const [authorized, setAuth] = useState(true)
    const [loading, setLoading] = useState(true)
    const [scroll, setScroll] = useState(0)
    const [is_liked, setisliked] = useState(false)
    const [is_viewed, setisviewed] = useState(false)
    const [comments, setComments] = useState([])
    const navigate = useNavigate()

    const CommentSchema = Yup.object().shape({
        text: Yup.string()
        .min(3, 'Слишком короткий текст')
        .max(2000, 'Слишком длинный текст')
        .required('Вы ничего не ввели')
      })

    const get_comments = useCallback(() => {
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_article_comments', MyParams)
            .then((response) => {
                if (response.data !== 0){
                    setComments(response.data)
                }
            }).catch((error) => {
                console.log(error)
            })
    }, [params.id])

    const delete_article = () => {
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/delete_article', MyParams)
            .then((response) => {
                console.log(response)
                navigate('/', {replace: true})
            }).catch((error) => {
                console.log(error)
            })
    }

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
                }
                console.log(error)
            })
        MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_article', MyParams)
            .then((response) => {
                setArticle(response.data['article'][0])
                setCategories(response.data['categories'])
            }).catch((error) => {
                console.log(error)
            })
        get_comments()
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [params])

    useEffect(() => {
        if (article) {
            document.title = article[0]
        }
    }, [article])

    useEffect(() => {
        if (login !== ' ') {
            var MyParams = {data: {'article_id': params.id, 'login': login}}
            axios.post('/api/main/checkLike', MyParams)
                .then((response) => {
                    setisliked(response.data[0][0])
                    console.log(response)
                    setLoading(false)
                }).catch((error) => {
                    console.log(error)
                    setLoading(false)
                })
        }
    }, [login, params.id])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        setAuth(false)
        setlogin('')
    }

    const handleScroll = () => {
        setScroll(window.scrollY)
    }

    const registrate_view = (scroll, login) => {
        if (scroll >= 200 && login !== ' ' && !is_viewed) {
            var MyParams = {data: {'article_id': params.id, 'login': login}}
            axios.post('/api/main/registrate_view', MyParams)
                .then((response) => {
                    setisviewed(true)
                    console.log(response)
                }).catch((error) => {
                    console.log(error)
                })
        }
    }

    const switchLike = () => {
        var MyParams = {data: {'article_id': params.id, 'login': login, 'is_liked': is_liked}}
        axios.post('/api/main/switchLike', MyParams)
            .then((response) => {
                is_liked ? setisliked(false) : setisliked(true)
                let a = article
                is_liked ? a[6]-- : a[6]++
                setArticle(a)
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
    }

    const add_comment = (values) => {
        var MyParams = {data: {'article_id': params.id, 'text': values.text, 'login': login}}
        axios.post('/api/main/add_comment', MyParams)
            .then((response) => {
                get_comments()
                let a = article
                a[7]++
                setArticle(a)
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
    }

    return (
        <>
        <div className='bg-success'>
            <Header authorized={authorized} login={login} role={role} exit={exit} page={'/article/' + params.id} />
        {loading ?
            <div className="App-loading">
                <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div>
                {registrate_view(scroll, login)}
                <div className='m-5 p-5 bg-body-tertiary'>
                    <Container>
                        <Row>
                            <Col xs={12} className='d-flex justify-content-center'>
                                <Container>
                                    <Row>
                                        <Col><h1>{article[0]}</h1></Col>
                                    </Row>
                                    <Row>
                                        <Col>Автор: <Button size="sm"><Link to={'/profile/' + article[1]} style={{textDecoration: 'none', color: 'white'}}>{article[2]}</Link></Button></Col>
                                        <Col className='text-end'>{article[3]}</Col>
                                    </Row>
                                    <Row className='mt-1'>
                                        <Col>Категории: {categories.map((category) => (<Button size="sm" variant="secondary" className='mx-1'><Link to={'/category/' + category[0]} style={{textDecoration: 'none', color: 'white'}}>{category[1]}</Link></Button>))}</Col>
                                    </Row>
                                    <Row>
                                        <Col><div className='mt-5' dangerouslySetInnerHTML={{ __html: article[4].replace(/\n/g, '<br />') }} /></Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col>
                                            <IconButton color="white" size="small" onClick={switchLike}>
                                                {is_liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                                            </IconButton>
                                            {article[6]}
                                        </Col>
                                        <Col className='text-end'>{article[5]} {article[5] === 1 ? 'просмотр' : ((article[5] < 4 && article[5] > 1) ? 'просмотра' : 'просмотров')}</Col>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Container>
                </div>
                {role === 'admin' && <Button className='mx-5' onClick={delete_article} variant='danger'>Удалить статью</Button>}
                <Container fluid className='mt-4 mx-5'>
                    {(authorized) ? (<Row>
                        <Col>
                            <Formik className='mx-3' initialValues={{ "text" : ''}} validationSchema={CommentSchema} onSubmit={(values, {resetForm}) => {add_comment(values); resetForm()}} >
                                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                                <div>
                                    <Form onSubmit={handleSubmit}>
                                        <div className='row'>
                                            <Field
                                                as='textarea'
                                                rows='2'
                                                className='col-4'
                                                name='text' 
                                                type='text' 
                                                placeholder='Комментарий' 
                                                value={values.text} 
                                                onChange={handleChange} 
                                                onBlur={handleBlur}/>
                                            <div className='m-1 col-2 d-flex align-self-center'>
                                                <IconButton type='submit' color='black' size='small'>
                                                    <AddBox />
                                                </IconButton>
                                            </div>
                                        </div>
                                        {errors.text && touched.text ? (
                                            <div style = {{color: 'red'}}>{errors.text}</div>
                                        ) : (<div>&nbsp;</div>)}
                                    </Form>
                                </div>
                            )}
                            </Formik>
                        </Col>
                    </Row>) : (<></>)}
                    <h4 className='text-light'>Комментарии ({article[7]})</h4>
                    {comments.map(comment => (
                      <Row><Col key={comment[0]}>
                        <Comment authorized={authorized} 
                            schema={CommentSchema} 
                            get_comments={get_comments} 
                            login={login}
                            role={role}
                            params={params}
                            comment={[...comment, params.id]} />
                      </Col></Row>
                    ))}
                </Container>
                {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
            </div>
        }
        </div>
        </>
    )
}

export default Article;