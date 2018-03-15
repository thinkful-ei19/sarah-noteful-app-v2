'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get All Folders (no searchTerm needed)
router.get('/folders', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get Folder by id)
router.get('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;

  knex.select('id', 'name')
    .from('folders')
    .where({id: folderId})
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

// Update Folder The noteful app does not use this endpoint but we'll create it in order to round out our API
/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;
  // Never trust users or developers - validate input 
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .update(updateObj)
    .where({id: folderId})
    .returning(['id', 'name'])
    .then(([item]) => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Create a Folder accepts an object with a name and inserts it in the DB. Returns the new item along the new id.
router.post('/folders', (req, res, next) => {
  const { name } = req.body;

  const newFolder = { name };

  //don't trust users or developers!! - validate input

  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex 
    .insert(newFolder)
    .into('folders')
    .returning(['id', 'name'])
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/folders/${item.id}`).status(201).json(item);
      }
    })
    .catch(err => next(err));
});

// Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status.
router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;
  knex('folders')
    .where({id})
    .del()
    .then(count => {
      if(count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// As you work, be sure to check your progress with Postman. Use Postman to select, create, update and delete folders and verify the results in the database. At any time, you can rerun the .sql script to drop the tables and repopulate them with sample data.

module.exports = router;