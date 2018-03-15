'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

//GET/READ all tags
router.get('/tags', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
  console.log(res.body);
});

// Get Folder by id
router.get('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  console.log(id);
  knex.first('id', 'name')
    .from('tags')
    .where({id})
    .then(tag => {
      if (tag) {
        res.json(tag);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

//POST/create tag
router.post('/tags', (req, res, next) => {
  const {name} = req.body;

  //don't trust users or developers
  if(!name) {
    const err = new Error('missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  const newTag = {name};

  knex.insert(newTag)
    .into('tags')
    .returning(['id', 'name'])
    .then(([tag]) => {
      if (tag) {
        res.location(`http://${req.headers.host}/tags/${tag.id}`).status(201).json(tag);
      }
      console.log(`${req.headers.host}`);
    })
    .catch(err => next(err));
});

//PUT/update a single tag
router.put('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  //never trust users/developers
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  //never trust users/developers
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('tags')
    .update(updateObj)
    .where({id})
    .returning(['id', 'name'])
    .then (([tag]) => {
      if (tag) {
        res.json(tag);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

//delete tag
router.delete('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  knex('tags')
    .where({id})
    .del()
    .then((count) => {
      if(count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


module.exports = router;
