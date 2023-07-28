
from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import requests
import random 


movies_dict = pickle.load(open('movies_dict.pkl', 'rb'))
movies_list = pd.DataFrame(movies_dict)
similarity = pickle.load(open('similarity.pkl', 'rb'))


def recommend_movie(movie):
    movie_index = movies_list[movies_list['title'] == movie].index[0]
    distances = similarity[movie_index]
    movies_sorted = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
    recommend_movies = []
    for i in movies_sorted:
        info = movies_list.iloc[i[0]].title
        recommend_movies.append({
            'title': info,
            'image_url': fetch_movie_poster(info)
        })
    return recommend_movies


def fetch_movie_poster(movie_name):
    movie_name = movie_name.replace(" ", "%20")
    movie_name = movie_name.replace("'", "%27")
    url = 'https://api.themoviedb.org/3/search/movie?api_key=(Your_Api_key)'.format(
        movie_name)
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return 'https://image.tmdb.org/t/p/original' + data['results'][0]['poster_path']
    else:
        print(f"Error: Failed to fetch movie data. Status code: {response.status_code}")
        return None


app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/about', methods=['GET', 'POST'])
def about():
    return render_template('list_of_movies.html', movies=movies_list.title.values)


@app.route('/get_recommendations', methods=['POST'])
def get_recommendations():
    selected_movie = request.json.get('selected_movie')
    recommendations = recommend_movie(selected_movie)
    return jsonify(recommendations)


@app.route('/movie_suggestions', methods=['GET'])
def movie_suggestions():
    search_query = request.args.get('query', '').strip()
    if search_query:
        # Get movie suggestions based on the search query (limit to top 5 matching movies)
        suggestions = [movie for movie in movies_list['title'] if search_query.lower() in movie.lower()]
        suggestions = suggestions[:5]
        return jsonify(suggestions)
    else:
        return jsonify([])  # Return an empty list if no search query provided


if __name__ == '__main__':
    app.run(debug=True)
