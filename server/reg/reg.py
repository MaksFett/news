from flask import request, Blueprint, send_file
from ..instances import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash
import os

reg_bp = Blueprint('reg_bp', __name__, template_folder='templates', static_folder='static')


@reg_bp.route('/', methods=['GET', 'POST'])
def reg():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    user = request.json['data']
    query1 = 'SELECT * FROM public."Users" WHERE login=%s'
    cursor.execute(query1, (user["login"],))
    data = cursor.fetchall()
    if len(data) == 1:
        return '0'
    else:
        access_token = create_access_token(identity=user["login"])
        query2 = 'INSERT INTO public."Users" (login, psswd) VALUES (%s, %s)'
        cursor.execute(query2, (user["login"], generate_password_hash(user["password"])))
    conn.commit()
    conn.close()
    return access_token


@reg_bp.route('/add_author', methods=['GET', 'POST'])
def add_author():
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    author = request.json['data']
    query1 = 'SELECT * FROM public."Authors" WHERE name=%s'
    cursor.execute(query1, (author["name"],))
    data = cursor.fetchall()
    if len(data) == 1:
        return '0'
    query = 'INSERT INTO public."Authors" (author_id, name) VALUES (%s, %s)'
    cursor.execute(query, (author["user_id"], author["name"], ))
    conn.commit()
    conn.close()
    response = {'author_name': author["name"], }
    return response
