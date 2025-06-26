import { ScheduleModel } from "../models/schedule.model";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../validators/schedule.validator";

export const createSchedule = async (input: CreateScheduleInput) => {
  const schedule = await ScheduleModel.create(input);
  return schedule;
};

export const getScheduleById = async (id: string) => {
  return await ScheduleModel.findById(id);
};

export const getAllSchedules = async () => {
  return await ScheduleModel.find().sort({ createdAt: -1 });
};

export const updateSchedule = async (
  id: string,
  input: UpdateScheduleInput
) => {
  const schedule = await ScheduleModel.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { new: true, runValidators: true }
  );
  return schedule;
};

export const deleteSchedule = async (id: string) => {
  const result = await ScheduleModel.findOneAndDelete({ _id: id });
  return !!result;
};
