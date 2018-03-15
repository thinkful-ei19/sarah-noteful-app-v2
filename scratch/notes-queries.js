'use strict';

const knex = require('../knex');

// knex.select(1).then(res => console.log(res));
knex.select()
  .from('notes')
  .then(res => {
    console.log(res);
  });

//get by id
knex.select('id', 'title', 'content')
  .from('notes')
  .where('id', 1001)
  .then(item => {
      
    res.json(item);
    
  });
   

// 
notes.find(noteId)
  .then(item => {
    if (item) {
      res.json(item);
    } else {
      next();
    }
  })
  .catch(err => next(err));
//   

// //update
knex('notes')
  .where({id: 1001})
  .update({title: 'new title', content: 'new content'})
  .returning(['id', 'title', 'content'])
  .then(res => {
    console.log(JSON.stringify(res, null, 4));
  });





// //post
knex
  .insert({title: 'title', content: 'content'})
  .into('notes')
  .returning(['id', 'title', 'content'])
  .then(res => {
    console.log(JSON.stringify(res, null, 4));
  });

knex('notes')
  .where({id: '1013'})
  .del()
  .then(res => {
    console.log(JSON.stringify(res, null, 4));
  });
