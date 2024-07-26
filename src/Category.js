import axios from 'axios'
import React, {useState, useEffect} from 'react'
import ListedArticle from './components/ListedArticle'
import Header from './components/Header'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ReactLoading from 'react-loading'
import { useParams } from 'react-router-dom'

export default function Category() {
    const [login, setlogin] = useState('')
    const [authorized, setAuth] = useState(false)
    const [articles, setArticles] = useState({})
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState({})
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
            if ((error.response.status === 401) || (error.response.status === 422)){
                setAuth(false)
                setLoading(false)
            }
            console.log(error)
        })
        var MyParams = {data: {'id': params.id}}
        axios.post('/api/main/get_category', MyParams)
        .then((response) => {
            setCategory(response.data[0])
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
    }, [articles, category])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        setAuth(false)
        setlogin('')
    }

    return (
      <>
        {loading ?
            <div className="App-loading">
            <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
            </div>
        :
            <div className='bg-success'>
                <Header authorized={authorized} login={login} exit={exit} page={'/'}/>
                <div className='mx-lg-5 my-3 p-5 bg-body-tertiary'>
                    <div>
                        <h2 className='m-3'>Категория {category[0]}</h2>
                        <h4 className='m-3'>Количество статей: {category[1]}</h4>
                    </div>
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
      </>
    );
  }