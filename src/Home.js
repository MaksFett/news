import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Header from './components/Header'
import ReactLoading from 'react-loading'
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import ListedArticle from './components/ListedArticle'

export default function Home() {
    const [login, setlogin] = useState('')
    const [authorized, setAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState([])
    const [key, setkey] = useState('')

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
      setkey('Popular')
    }, [])
    
    useEffect(() => {
      var MyParams = {}
      if (key === 'Popular') {
        axios.get('/api/main/get_popular_articles', MyParams)
          .then((response) => {
            setArticles(response.data)
            console.log(articles)
          }).catch((error) => {
            console.log(error)
          })
      }
      else if (key === 'Recent') {
        axios.get('/api/main/get_recent_articles', MyParams)
          .then((response) => {
            setArticles(response.data)
            console.log(articles)
          }).catch((error) => {
            console.log(error)
          })
      }
    }, [key])

    useEffect(() => {
        setLoading(false)
    }, [articles])

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
            <div className='mx-5 my-3 p-5 bg-body-tertiary'>
              <div className='text-center'>
                <Tabs activeKey={key} onSelect={(k) => setkey(k)} fill>
                  <Tab eventKey='Popular' title='Популяроное'></Tab>
                  <Tab eventKey='Recent' title='Свежее'></Tab>
                </Tabs>
              </div>
              <div>
                <Container fluid className='mt-5 px-5'>
                      {articles.map(article => (
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