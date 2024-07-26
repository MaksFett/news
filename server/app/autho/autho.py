from flask import request, Blueprint
from instances import db
from datetime import timedelta
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

autho_bp = Blueprint('autho_bp', __name__, template_folder='templates', static_folder='static')


@autho_bp.route('/', methods=['GET', 'POST'])
def autho():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    user = request.json['data']
    query = 'SELECT * FROM public."Users" WHERE login=%s'
    cursor.execute(query, (user["login"],))
    data = cursor.fetchall()
    if len(data) == 0:
        return '0'
    elif check_password_hash(data[0][2], user['password']):
        access_token = create_access_token(identity=user["login"], expires_delta=timedelta(days=3))
    else:
        return '0'
    conn.commit()
    conn.close()
    return access_token


@autho_bp.route('/getuser', methods=['GET', 'POST'])
def getuser():
    login = request.json['data']
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    query1 = 'SELECT * FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (login,))
    user_data = cursor.fetchall()
    user = {'id': user_data[0][0], 'login': user_data[0][1], }
    query2 = 'SELECT * FROM public."Authors" WHERE author_id=%s'
    cursor.execute(query2, (user_data[0][0],))
    author = cursor.fetchall()
    if author:
        user['author_name'] = author[0][1]
        user['article_count'] = author[0][3]
        query3 = 'SELECT publisher_id, name FROM public."Publishers" WHERE publisher_id=%s'
        cursor.execute(query3, (author[0][2],))
        publisher = cursor.fetchall()
        if publisher:
            user['publisher_name'] = publisher[0][1]
            user['publisher_id'] = publisher[0][0]
    return user
