'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
/* 
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);
*/

// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  const {folderId} = req.query;
  knex.select('notes.id', 'title', 'content', 'folders.id as folder_Id', 'folders.name as folder_Name')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where(function() {
      if(searchTerm) {
        this.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_Id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
  console.log(res.body);
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;

  knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folder_name')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where({'notes.id': noteId})
    .then(item => {
      console.log(item);
      if (item) {
        res.json(item[0]);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/*
  notes.find(noteId)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updateObj)
    .where({id: noteId})
    .returning(['id'])
    .then(() => {
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([item]) => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  /*
  notes.update(noteId, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id } = req.body; //added folder_id
  
  const newItem = { title, content, folder_id };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  // Insert new note, instead of returning all the fields, just return the new `id`
  knex.insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      console.error(err);
    });
});

//post router knex before folders table
//   knex
//     .insert(newItem)
//     .into('notes')
//     .returning(['id', 'title', 'content'])
//     .then(item => {
//       if (item) {
//         res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
//       } 
//     })
//     .catch(err => next(err));
//   console.log(res.body);
// });
/*
  notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      } 
    })
    .catch(err => next(err));
  */


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .where({id: id})
    .del()
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/*
  notes.delete(id)
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */


module.exports = router;
