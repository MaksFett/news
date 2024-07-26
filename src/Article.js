import React, {useState, useEffect} from 'react'
import {useParams, Link} from 'react-router-dom'
import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Header from './components/Header'
import Comment from './components/Comment'
import ReactLoading from 'react-loading'
import IconButton from '@mui/material/IconButton'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import AddBox from '@mui/icons-material/AddBox'

function Article(){
    const params = useParams()
    const [login, setlogin] = useState(' ')
    const [article, setArticle] = useState()
    const [categories, setCategories] = useState([])
    const [authorized, setAuth] = useState(true)
    const [loading, setLoading] = useState(true)
    const [scroll, setScroll] = useState(0)
    const [is_liked, setisliked] = useState(false)
    const [is_viewed, setisviewed] = useState(false)
    const [comments, setComments] = useState([])

    const CommentSchema = Yup.object().shape({
        text: Yup.string()
        .min(3, 'Слишком короткий текст')
        .max(2000, 'Слишком длинный текст')
        .required('Вы ничего не ввели')
      })

    useEffect(() => {
        var MyParams = {headers: {
            Authorization: 'Bearer ' + localStorage.getItem("jwt_token")
        }}
        axios.get('/api/main/readlogin', MyParams)
            .then((response) => {
                setlogin(response.data)
                setAuth(true)
            }).catch((error) => {
                if ((error.response.status === 401) || (error.response.status === 422)){
                    setAuth(false)
                }
                console.log(error)
            })
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_article', MyParams)
            .then((response) => {
                setArticle(response.data['article'][0])
                console.log(response.data, article)
                setCategories(response.data['categories'])
            }).catch((error) => {
                console.log(error)
            })
        get_comments()
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [params])

    useEffect(() => {
        if (login !== ' ') {
            console.log(login)
            var MyParams = {data: {'article_id': params.id, 'login': login}}
            axios.post('/api/main/checkLike', MyParams)
                .then((response) => {
                    setisliked(response.data[0][0])
                    console.log(response)
                }).catch((error) => {
                    console.log(error)
                })
        }
        setTimeout(() => setLoading(false), 500)
    }, [login])

    const get_comments = () => {
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_article_comments', MyParams)
            .then((response) => {
                if (response.data !== 0){
                    setComments(response.data)
                }
            }).catch((error) => {
                console.log(error)
            })
    }

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
                is_liked ? a[8]-- : a[8]++
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
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
    }

    return(
        <>
        {loading ?
            <div className="App-loading">
            <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div className='bg-success'>
                <Header authorized={authorized} login={login} exit={exit} page={'/article/' + params.id} />
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
                                        <Col>Автор: <Link to={'/profile/' + article[1]} style={{textDecoration: 'none', color: 'black'}}>{article[2]}</Link></Col>
                                        {article[4] !== null ? <Col className='text-center'>Издательство: <Link to={'/publisher/' + article[4]} style={{textDecoration: 'none', color: 'black'}}>{article[5]}</Link></Col> : <></>}
                                        <Col className='text-center'>Категории: {categories.map((category, index) => (<Link to={'/category/' + category[0]} style={{textDecoration: 'none', color: 'black'}}>{(index === 0) ? (category[1]) : (', ' + category[1])}</Link>))}</Col>
                                        <Col className='text-end'>{article[3]}</Col>
                                    </Row>
                                    <Row className='mt-4'>
                                        <Col><h3>Текст</h3></Col>
                                    </Row>
                                    <Row>
                                        <Col><div dangerouslySetInnerHTML={{ __html: article[6].replace(/\n/g, '<br />') }} /></Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col>
                                            <IconButton color="white" size="small" onClick={switchLike}>
                                                {is_liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                                            </IconButton>
                                            {article[8]}
                                        </Col>
                                        <Col className='text-center'>{article[7]} {article[7] === 1 ? 'просмотр' : ((article[7] < 4 && article[7] > 1) ? 'просмотра' : 'просмотров')}</Col>
                                        <Col className='text-end'>{article[9]} {article[9] === 1 ? 'комментарий' : ((article[9] < 4 && article[9] > 1) ? 'комментария' : 'комментариев')}</Col>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Container>
                </div>
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
                    <h4 className='text-light'>Комментарии</h4>
                    {comments.map(comment => (
                      <Row><Col key={comment[0]}>
                        <Comment authorized={authorized} 
                        schema={CommentSchema} 
                        get_comments={get_comments} 
                        login={login}
                        params={params}
                        comment={[...comment, params.id]} />
                      </Col></Row>
                    ))}
                </Container>
                {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
            </div>
        }
        </>
    )
}

export default Article;