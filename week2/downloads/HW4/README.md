Homework: Homework 2.4

How many documents in our video.movieDetails collection list just the following two genres: "Comedy" and "Crime" with "Comedy" listed first.

NOTE: There is a dump of the video database included in the handouts for the "Creating Documents" lesson. Use that data set to answer this question.


0
9
14
20
33
47
62
101
122
205

```
Ans: 20
 db.movieDetails.find({"genres": ["Comedy", "Crime"]}).count();
 ```