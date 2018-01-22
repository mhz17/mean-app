import { Component, OnInit } from '@angular/core';
import { GetDataService } from '../get-data.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  // instantiate posts to an empty array
  posts: any = [];

  constructor(private postsService: GetDataService) { }

  ngOnInit() {
    // // Retrieve posts from the API
    // this.postsService.getAllData().subscribe(posts => {
    //   this.posts = posts;
    // });
  }
}
