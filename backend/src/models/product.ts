import mongoose from "mongoose";

interface IImage {
  filename: string;
  originalName: string;
}

interface IProduct {
  title: string;
  image: IImage;
  category: string;
  description: string;
  price: number | null;
}

const imageSchema = new mongoose.Schema<IImage>({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  }
});

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    unique: true,
  },
  image: imageSchema,
  category : {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

export default mongoose.model<IProduct>('product', productSchema);