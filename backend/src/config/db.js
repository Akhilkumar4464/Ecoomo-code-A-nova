const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully.');
      isMongoConnected = true;
    } catch (err) {
      console.error('MongoDB connection failed. Falling back to local JSON database.', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI provided. Running E-Commerce with local JSON database.');
    isMongoConnected = false;
  }
};

const getMongoStatus = () => isMongoConnected;

// FileModel helper to mock Mongoose API for a local JSON-file-based database
class FileModel {
  constructor(modelName) {
    this.modelName = modelName.toLowerCase();
    this.filePath = path.join(DATA_DIR, `${this.modelName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  _generateId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  async find(filter = {}) {
    let data = this._read();
    
    // Apply basic filter
    return data.filter(item => {
      for (let key in filter) {
        if (filter[key] instanceof RegExp) {
          if (!filter[key].test(item[key])) return false;
        } else if (typeof filter[key] === 'object' && filter[key] !== null) {
          // e.g., $regex
          if (filter[key].$regex) {
            const regex = new RegExp(filter[key].$regex, filter[key].$options || '');
            if (!regex.test(item[key])) return false;
          }
        } else if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }).map(item => this._wrapInstance(item));
  }

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    let data = this._read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;

    // Handle updates, including nested object updates like profile
    const current = data[index];
    
    // Flatten out any Mongoose $set or direct keys
    const updates = updateData.$set || updateData;
    
    data[index] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this._write(data);
    return this._wrapInstance(data[index]);
  }

  async create(docData) {
    let data = this._read();
    const newDoc = {
      _id: this._generateId(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newDoc);
    this._write(data);
    return this._wrapInstance(newDoc);
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this._write([]);
      return { deletedCount: 0 };
    }
    let data = this._read();
    const originalCount = data.length;
    const remaining = data.filter(item => {
      for (let key in filter) {
        if (item[key] === filter[key]) return false;
      }
      return true;
    });
    this._write(remaining);
    return { deletedCount: originalCount - remaining.length };
  }

  async deleteOne(filter = {}) {
    let data = this._read();
    const index = data.findIndex(item => {
      for (let key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    if (index !== -1) {
      data.splice(index, 1);
      this._write(data);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  _wrapInstance(doc) {
    if (!doc) return null;
    const self = this;
    const instance = { ...doc };
    
    // Add Mongoose-like save method
    instance.save = async function() {
      let data = self._read();
      const index = data.findIndex(item => item._id === instance._id);
      
      const toSave = { ...instance };
      delete toSave.save; // Don't serialize the save function
      
      if (index !== -1) {
        toSave.updatedAt = new Date().toISOString();
        data[index] = toSave;
      } else {
        toSave._id = toSave._id || self._generateId();
        toSave.createdAt = toSave.createdAt || new Date().toISOString();
        toSave.updatedAt = new Date().toISOString();
        data.push(toSave);
      }
      self._write(data);
      return self._wrapInstance(toSave);
    };

    return instance;
  }
}

// Wrapper function to define a schema and export either MongoDB Mongoose Model or FileModel
const defineModel = (modelName, mongooseSchema) => {
  return {
    // Getter that dynamically forwards requests to Mongoose model or FileModel
    get model() {
      if (isMongoConnected) {
        return mongoose.model(modelName, mongooseSchema);
      }
      if (!this._fileModel) {
        this._fileModel = new FileModel(modelName);
      }
      return this._fileModel;
    },
    
    // Expose Mongoose-like query interface
    async find(filter) { return this.model.find(filter); },
    async findOne(filter) { return this.model.findOne(filter); },
    async findById(id) { return this.model.findById(id); },
    async findByIdAndUpdate(id, updateData, options) { return this.model.findByIdAndUpdate(id, updateData, options); },
    async create(docData) { return this.model.create(docData); },
    async deleteMany(filter) { return this.model.deleteMany(filter); },
    async deleteOne(filter) { return this.model.deleteOne(filter); },
    
    // Enable constructing a new document instantiable as new Model(data)
    createInstance(data = {}) {
      if (isMongoConnected) {
        const MongooseModel = mongoose.model(modelName);
        return new MongooseModel(data);
      }
      // For FileModel, return wrapped doc
      if (!this._fileModel) {
        this._fileModel = new FileModel(modelName);
      }
      return this._fileModel._wrapInstance(data);
    }
  };
};

module.exports = {
  connectDB,
  getMongoStatus,
  defineModel
};
