const mongoose = require("mongoose");

//collection recette//
const recetteSchema = mongoose.Schema({
  title: String,
  photo: String,
  prep_duration: Number,
  cook_duration: Number,
  duration: Number,
  difficulty: Number,
  servings: Number,
  description: String,
  course_type: String,
  diet_tags: [String],
  appliance_tags: [String],
  preservation_duration: String,
  ingredients: [
    {
      name: String,
      quantity: Number,
      unit: String,
      is_primary: Boolean,
    },
  ],
  steps: [
    {
      stage: String,
      duration: Number,
      action: String,
      target: [String],
    },
  ],
});

const Recette = mongoose.model("recette", recetteSchema);

module.exports = Recette;
