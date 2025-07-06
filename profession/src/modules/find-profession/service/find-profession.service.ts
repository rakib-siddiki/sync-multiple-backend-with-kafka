import { FindProfessionModel } from "../models/find-profession.model";

const getAll = async () => {
  const professions = await FindProfessionModel.find()
    .populate("branch")
    .populate("reviews");
  return professions;
};

export const professionService = {
  getAll,
};
