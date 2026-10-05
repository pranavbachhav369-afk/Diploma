export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password_hash: string;
  branch: string;
  year: string;
  semester: string;
  is_active: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'superadmin' | 'moderator';
  created_at: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  icon: string;
  is_active: boolean;
  order: number;
}

export interface PDFPageContent {
  page_number: number;
  title: string;
  subtitle?: string;
  content: string;
  highlights?: string[];
  formulas?: string[];
  is_preview: boolean;
}

// ==========================================
// CLASSPLUS STYLE COURSE & FOLDER ARCHITECTURE
// ==========================================

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  branch: string; // e.g. "Computer Engineering"
  semester: number; // 1 to 6
  year: string; // "1st Year", "2nd Year", "3rd Year"
  description: string;
  features?: string[];
  price: number;
  discount_price?: number;
  is_published: boolean;
  validity: string; // e.g. "MSBTE Winter/Summer Exams", "1 Year", "Lifetime"
  thumbnail_color?: string; // gradient preset
  enrolled_count: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subcourse {
  id: string;
  course_id: string;
  title: string; // e.g. "Software Engineering"
  subject_code: string; // e.g. "22517"
  description: string;
  order: number;
  price?: number; // Optional standalone subject price
  discount_price?: number;
  is_published: boolean;
  created_at: string;
}

export interface Folder {
  id: string;
  course_id: string;
  subcourse_id: string;
  parent_folder_id: string | null; // Supports unlimited nesting like Classplus
  name: string; // e.g. "📁 Unit 1: Introduction & Process Models"
  order: number;
  created_at: string;
}

export interface PDFDocument {
  id: string;
  course_id: string;
  subcourse_id: string;
  folder_id: string;
  title: string; // e.g. "Software Engineering Complete Unit 1 Notes.pdf"
  description: string;
  total_pages: number;
  file_size: string; // e.g. "4.8 MB"
  is_free_preview: boolean; // Classplus "Free Preview" toggle
  price?: number; // Optional individual document purchase price
  is_published: boolean;
  pages: PDFPageContent[];
  download_count: number;
  uploaded_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'course' | 'subcourse' | 'pdf';
  item_id: string;
  item_title: string;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  coupon_code?: string;
  payment_gateway: 'razorpay' | 'upi_simulated';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  items: OrderItem[];
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_type: 'course' | 'subcourse' | 'pdf';
  item_id: string; // ID of course, subcourse or PDF
  order_id: string;
  purchased_at: string;
  access_revoked: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent?: number;
  discount_fixed?: number;
  min_order_value: number;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'exam_alert' | 'new_course' | 'discount' | 'general';
  link?: string;
  created_at: string;
  is_active: boolean;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_branch: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  admins: Admin[];
  branches: Branch[];
  courses: Course[];
  subcourses: Subcourse[];
  folders: Folder[];
  pdfs: PDFDocument[];
  orders: Order[];
  purchases: Purchase[];
  coupons: Coupon[];
  notifications: Notification[];
  reviews: Review[];
}
