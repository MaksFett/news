from flask import request, Blueprint
from ..instances import db
from flask_jwt_extended import jwt_required, get_jwt_identity

admin_bp = Blueprint('admin_bp', __name__, template_folder='templates', static_folder='static')


@admin_bp.route('/get_all', methods=['GET'])
@jwt_required()
def get_all():
    role = get_jwt_identity()['role']
    if role != 'admin':
        return 0
    conn = db.session.connection()
    cursor = conn.connection.cursor()
    query1 = 'SELECT U.user_id, U.login, U.is_admin, A.name, A.article_count FROM public."Users" AS U ' \
             'LEFT JOIN public."Authors" AS A ON U.user_id = A.author_id'
    cursor.execute(query1)
    users = []
    for i in cursor.fetchall():
        users.append({'id': i[0], 'login': i[1], 'is_admin': i[2], 'name': i[3], 'count': i[4]})
    query2 = 'SELECT * FROM public."Articles"'
    cursor.execute(query2)
    articles = []
    for i in cursor.fetchall():
        articles.append({'id': i[0], 'author': i[1], 'date': i[2], 'title': i[3], 'text': i[4], 'comm_count': i[5],
                         'view_count': i[6], 'like_count': i[7]})
    query3 = 'SELECT * FROM public."Categories"'
    cursor.execute(query3)
    categories = []
    for i in cursor.fetchall():
        categories.append({'id': i[0], 'name': i[1], 'count': i[2]})
    query4 = 'SELECT * FROM public."Comments"'
    cursor.execute(query4)
    comments = []
    for i in cursor.fetchall():
        comments.append({'id': i[0], 'user': i[1], 'article': i[2], 'text': i[3], 'date': i[4], 'parent': i[5]})
    all_tables = {'users': users, 'articles': articles, 'categories': categories, 'comments': comments}
    return all_tables