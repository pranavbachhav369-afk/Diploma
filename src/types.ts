export interface StudentUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  branch: string;
  year: string;
  semester: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'moderator';
}

export interface PDFPage {
  page_number: number;
  title: string;
  subtitle?: string;
  content: string;
  highlights?: string[];
  formulas?: string[];
  is_preview: boolean;
}

export interface PDFItem {
  id: string;
  course_id: string;
  subcourse_id: string;
  folder_id: string;
  title: string;
  description: string;
  total_pages: number;
  file_size: string;
  is_free_preview: boolean;
  price?: number;
  is_published: boolean;
  can_access?: boolean;
  pages?: PDFPage[];
  uploaded_at: string;
}

export interface FolderItem {
  id: string;
  course_id: string;
  subcourse_id: string;
  parent_folder_id: string | null;
  name: string;
  order: number;
  pdfs: PDFItem[];
}

export interface SubcourseItem {
  id: string;
  course_id: string;
  title: string;
  subject_code: string;
  description: string;
  order: number;
  price?: number;
  discount_price?: number;
  is_published?: boolean;
  folders: FolderItem[];
}

export interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  branch: string;
  semester: number;
  year: string;
  description: string;
  features?: string[];
  price: number;
  discount_price?: number;
  is_published: boolean;
  validity: string;
  thumbnail_color?: string;
  enrolled_count: number;
  rating: number;
  reviews_count: number;
  total_subcourses?: number;
  total_pdfs?: number;
  total_pages?: number;
  is_enrolled?: boolean;
  subcourses?: SubcourseItem[];
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  icon: string;
  is_active: boolean;
  order: number;
}

export interface PurchasedItem {
  purchase_id: string;
  item_type: 'course' | 'subcourse' | 'pdf';
  item_id: string;
  title: string;
  subtitle: string;
  total_pdfs: number;
  purchased_at: string;
  material_id?: string;
  subject_code?: string;
  subject_name?: string;
  order_id?: string;
  purchase_date?: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  semester: number;
  year?: string;
  material_type: string;
  description: string;
  total_pages: number;
  file_size: string;
  price: number;
  discount_price?: number;
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  is_free?: boolean;
  sample_pages?: any[];
  can_access?: boolean;
  is_purchased?: boolean;
  category_id?: string;
  bundle_materials?: any[];
  download_count?: number;
}

export interface CartItem {
  id: string;
  material_id: string;
  title: string;
  subject_code?: string;
  subject_name?: string;
  material_type?: string;
  price: number;
  discount_price?: number;
  original_price?: number;
  file_size?: string;
  total_pages?: number;
  added_at?: string;
}

export interface ReviewItem {
  id: string;
  material_id?: string;
  course_id?: string;
  user_name: string;
  user_branch?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
  semester: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  coupon_code?: string;
  payment_gateway: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  items: {
    id: string;
    item_type: string;
    item_id: string;
    item_title: string;
    price: number;
  }[];
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discount_percent?: number;
  discount_fixed?: number;
  min_order_value: number;
  expiry_date: string;
  usage_count: number;
  is_active: boolean;
}
