from instances import db
from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

main_bp = Blueprint('books_bp', __name__, template_folder='templates', static_folder='static')

months = {"January": "Января",
           "February": "Февраля",
           "Marсh": "Марта",
           "April": "Апреля",
           "May": "Мая",
           "June": "Июня",
           "July": "Июля",
           "August": "Августа",
           "September": "Сентября",
           "October": "Октября",
           "November": "Ноября",
           "December": "Декабря"}


def get_date(date):
    str_date = date.strftime("%I:%M ") + str(int(date.strftime("%d"))) + date.strftime(" %B %Y")
    for i in months.keys():
        str_date = str_date.replace(i, months[i])
    return str_date


@main_bp.route('/get_article', methods=['GET', 'POST'])
def get_article():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query1 = 'SELECT ART.title, US.login, AUT.name, ART.created, PUB.publisher_id, ' \
             'PUB.name, ART.text, ART.view_count, ART.like_count, ART.comment_count ' \
             'FROM Public."Articles" AS ART ' \
             'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
             'LEFT JOIN Public."Publishers" AS PUB ON AUT.publisher_id = PUB.publisher_id ' \
             'JOIN Public."Users" AS US ON AUT.author_id = US.user_id ' \
             'WHERE ART.article_id = %s'
    cursor.execute(query1, (data['id'], ))
    article = cursor.fetchall()
    article[0] = list(article[0])
    article[0][3] = get_date(article[0][3])
    query2 = 'SELECT CAT.category_id, CAT.name FROM public."Articles_Categories" AS ART_CAT ' \
             'JOIN public."Categories" AS CAT ON ART_CAT.category_id = CAT.category_id ' \
             'WHERE ART_CAT.article_id = %s'
    cursor.execute(query2, (data['id'], ))
    categories = cursor.fetchall()
    conn.commit()
    conn.close()
    print(article)
    return {'article': article, 'categories': categories}


@main_bp.route('/get_article_comments', methods=['GET', 'POST'])
def get_article_comments():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT ' \
            '   COM.comment_id, ' \
            '   US.login, ' \
            '   COM.created, ' \
            '   COM.text, ' \
            '   AUT.name ' \
            'FROM Public."Comments" AS COM ' \
            'JOIN Public."Users" AS US ON COM.user_id = US.user_id ' \
            'LEFT JOIN Public."Authors" AS AUT ON AUT.author_id = US.user_id ' \
            'WHERE COM.article_id=%s AND COM.parent_id IS NULL ' \
            'ORDER BY COM.created DESC'
    cursor.execute(query, (data['id'], ))
    comments = cursor.fetchall()
    if len(comments) == 0:
        return '0'
    for i in range(len(comments)):
        comments[i] = list(comments[i])
        comments[i][2] = get_date(comments[i][2])
    conn.commit()
    conn.close()
    print(comments)
    return comments


@main_bp.route('/get_answer_comments', methods=['GET', 'POST'])
def get_answer_comments():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT ' \
            '   COM.comment_id, ' \
            '   US.login, ' \
            '   COM.created, ' \
            '   COM.text, ' \
            '   AUT.name ' \
            'FROM Public."Comments" AS COM ' \
            'JOIN Public."Users" AS US ON COM.user_id = US.user_id ' \
            'LEFT JOIN Public."Authors" AS AUT ON AUT.author_id = US.user_id ' \
            'WHERE COM.article_id=%s AND COM.parent_id=%s ' \
            'ORDER BY COM.created ASC'
    cursor.execute(query, (data['article'], data['id'], ))
    comments = cursor.fetchall()
    if len(comments) == 0:
        return '0'
    for i in range(len(comments)):
        comments[i] = list(comments[i])
        comments[i][2] = get_date(comments[i][2])
    conn.commit()
    conn.close()
    return comments


@main_bp.route('/registrate_view', methods=['GET', 'POST'])
def registrate_view():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query1 = 'SELECT user_id FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (data['login'], ))
    user_id = cursor.fetchall()
    query2 = 'SELECT * FROM public."Views" WHERE article_id=%s AND user_id=%s'
    cursor.execute(query2, (data['article_id'], user_id[0], ))
    if len(cursor.fetchall()) != 0:
        return '0'
    query3 = 'INSERT INTO public."Views"(article_id, user_id) VALUES (%s, %s)'
    cursor.execute(query3, (data['article_id'], user_id[0], ))
    conn.commit()
    conn.close()
    return '1'


@main_bp.route('/checkLike', methods=['GET', 'POST'])
def check_like():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query1 = 'SELECT user_id FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (data['login'], ))
    user_id = cursor.fetchall()
    query2 = 'SELECT is_liked FROM public."Views" WHERE article_id=%s AND user_id=%s'
    cursor.execute(query2, (data['article_id'], user_id[0], ))
    results = cursor.fetchall()
    conn.commit()
    conn.close()
    if len(results) == 0:
        return [False]
    print(results)
    return results


@main_bp.route('/switchLike', methods=['GET', 'POST'])
def switch_like():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query1 = 'SELECT user_id FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (data['login'],))
    user_id = cursor.fetchall()
    query2 = 'UPDATE public."Views" SET is_liked=%s WHERE article_id=%s AND user_id=%s'
    cursor.execute(query2, (not data['is_liked'], data['article_id'], user_id[0], ))
    conn.commit()
    conn.close()
    return '1'


@main_bp.route('/add_comment', methods=['GET', 'POST'])
def add_comment():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query1 = 'SELECT user_id FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (data['login'],))
    user_id = cursor.fetchall()
    if 'parent_id' in data:
        query2 = 'INSERT INTO public."Comments"(user_id, article_id, parent_id, text, created) ' \
                 'VALUES (%s, %s, %s, %s, now())'
        cursor.execute(query2, (user_id[0], data['article_id'], data['parent_id'], data['text'],))
    else:
        query2 = 'INSERT INTO public."Comments"(user_id, article_id, text, created) ' \
                 'VALUES (%s, %s, %s, now())'
        cursor.execute(query2, (user_id[0], data['article_id'], data['text'],))
    conn.commit()
    conn.close()
    return '1'


@main_bp.route('/add_article', methods=['GET', 'POST'])
def add_article():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    print(data)
    if len(data['categories']) < 1:
        return '0'
    query1 = 'INSERT INTO public."Articles"(author_id, created, title, text) ' \
             'VALUES (%s, now(), %s, %s) RETURNING article_id'
    cursor.execute(query1, (data['author_id'], data['title'], data['text'], ))
    art_id = cursor.fetchall()
    for i in data['categories']:
        query2 = 'SELECT category_id FROM public."Categories" WHERE name=%s'
        cursor.execute(query2, (i, ))
        cat_id = cursor.fetchall()
        if len(cat_id) == 0:
            query3 = 'INSERT INTO public."Categories"(name, article_count) VALUES (%s, 1) RETURNING category_id'
            cursor.execute(query3, (i, ))
            cat_id = cursor.fetchall()
        query3 = 'INSERT INTO public."Articles_Categories"(article_id, category_id) VALUES (%s, %s)'
        print(art_id, '  ', cat_id)
        cursor.execute(query3, (art_id[0], cat_id[0]))
    conn.commit()
    conn.close()
    return '1'


@main_bp.route('/readlogin', methods=['GET', 'POST'])
@jwt_required()
def readlogin():
    return get_jwt_identity()


@main_bp.route('/get_category', methods=['GET', 'POST'])
def get_category():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT CAT.name, CAT.article_count ' \
            'FROM Public."Categories" AS CAT ' \
            'WHERE CAT.category_id = %s'
    cursor.execute(query, (data['id'], ))
    category = cursor.fetchall()
    conn.commit()
    conn.close()
    print(category)
    return category


@main_bp.route('/get_publisher', methods=['GET', 'POST'])
def get_publisher():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT PUB.name, PUB.article_count, PUB.author_count ' \
            'FROM Public."Publishers" AS PUB ' \
            'WHERE PUB.publisher_id = %s'
    cursor.execute(query, (data['id'], ))
    publisher = cursor.fetchall()
    conn.commit()
    conn.close()
    print(publisher)
    return publisher


@main_bp.route('/get_popular_articles', methods=['GET', 'POST'])
def get_popular_articles():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    query = 'SELECT ' \
            '   ART.article_id, ' \
            '   ART.title, ' \
            '   AUT.name, ' \
            '   ART.created ' \
            'FROM Public."Articles" AS ART ' \
            'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
            'ORDER BY ART.view_count DESC ' \
            'LIMIT 10'
    cursor.execute(query)
    articles = cursor.fetchall()
    for i in range(len(articles)):
        articles[i] = list(articles[i])
        articles[i][3] = get_date(articles[i][3])
    conn.commit()
    conn.close()
    print(articles)
    return articles


@main_bp.route('/get_recent_articles', methods=['GET', 'POST'])
def get_recent_articles():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    query = 'SELECT ' \
            '   ART.article_id, ' \
            '   ART.title, ' \
            '   AUT.name, ' \
            '   ART.created ' \
            'FROM Public."Articles" AS ART ' \
            'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
            'ORDER BY ART.created DESC ' \
            'LIMIT 10'
    cursor.execute(query)
    articles = cursor.fetchall()
    for i in range(len(articles)):
        articles[i] = list(articles[i])
        articles[i][3] = get_date(articles[i][3])
    conn.commit()
    conn.close()
    print(articles)
    return articles


@main_bp.route('/get_author_articles', methods=['GET', 'POST'])
def get_author_articles():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    login = request.json['data']
    query1 = 'SELECT user_id FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (login,))
    user_id = cursor.fetchall()
    query2 = 'SELECT ' \
             '   ART.article_id, ' \
             '   ART.title, ' \
             '   AUT.name, ' \
             '   ART.created ' \
             'FROM Public."Articles" AS ART ' \
             'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
             'WHERE AUT.author_id = %s'
    cursor.execute(query2, (user_id[0], ))
    articles = cursor.fetchall()
    for i in range(len(articles)):
        articles[i] = list(articles[i])
        articles[i][3] = get_date(articles[i][3])
    conn.commit()
    conn.close()
    print(articles)
    return articles


@main_bp.route('/get_articles_by_category', methods=['GET', 'POST'])
def get_articles_by_category():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT ' \
            '   ART.article_id, ' \
            '   ART.title, ' \
            '   AUT.name, ' \
            '   ART.created ' \
            'FROM Public."Articles_Categories" AS ARTCAT ' \
            'JOIN Public."Articles" AS ART ON ARTCAT.article_id = ART.article_id ' \
            'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
            'INNER JOIN Public."Categories" AS CAT ON ARTCAT.category_id = CAT.category_id ' \
            'WHERE CAT.category_id = %s'
    cursor.execute(query, (data['id'], ))
    articles = cursor.fetchall()
    for i in range(len(articles)):
        articles[i] = list(articles[i])
        articles[i][3] = get_date(articles[i][3])
    conn.commit()
    conn.close()
    print(articles)
    return articles


@main_bp.route('/get_articles_by_publisher', methods=['GET', 'POST'])
def get_articles_by_publisher():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    data = request.json['data']
    query = 'SELECT ' \
            '   ART.article_id, ' \
            '   ART.title, ' \
            '   AUT.name, ' \
            '   ART.created ' \
            'FROM Public."Articles" AS ART ' \
            'JOIN Public."Authors" AS AUT ON ART.author_id = AUT.author_id ' \
            'JOIN Public."Publishers" AS PUB ON AUT.publisher_id = PUB.publisher_id ' \
            'WHERE PUB.publisher_id = %s'
    cursor.execute(query, (data['id'], ))
    articles = cursor.fetchall()
    for i in range(len(articles)):
        articles[i] = list(articles[i])
        articles[i][3] = get_date(articles[i][3])
    conn.commit()
    conn.close()
    print(articles)
    return articles


@main_bp.route('/get_search_options', methods=['GET', 'POST'])
def get_search_options():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    query1 = 'SELECT category_id, name FROM public."Categories"'
    cursor.execute(query1)
    categories = cursor.fetchall()
    query2 = 'SELECT publisher_id, name FROM public."Publishers"'
    cursor.execute(query2)
    publishers = cursor.fetchall()
    query3 = 'SELECT U.login, A.name FROM public."Authors" AS A ' \
             'JOIN public."Users" AS U ON A.author_id=U.user_id'
    cursor.execute(query3)
    authors = cursor.fetchall()
    query4 = 'SELECT article_id, title FROM public."Articles"'
    cursor.execute(query4)
    articles = cursor.fetchall()
    conn.commit()
    conn.close()
    data = [categories, publishers, authors, articles]
    print(data)
    return data

